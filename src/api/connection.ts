import toastEventBus from "primevue/toasteventbus";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig, ResponseType } from "axios";
import axios, { AxiosRequestConfig } from "axios";
import { userDataConfig } from "@/store/loginStore/storeUserData";
import { abortAllRequests, getAbortSignal } from "@/hooks/composable/abortManager.ts";
import { pinia } from "@/pinia.ts";
import { format, isValid, parseISO } from "date-fns";
import { authChannel } from "@/api/authChannel.ts";

// Base URL taken from an environment variable
let baseURL: string = import.meta.env.VITE_TS_VUE_API;
export const axiosInstance = axios.create({ baseURL });
// use for requests that do not require sending it with the token, such as a refresh or an external get to the same backend server url
export const authClient = axios.create({ baseURL: import.meta.env.VITE_TS_VUE_API });
let isRefreshing = false;
let failedQueue: {
    resolve: (value?: AxiosResponse | PromiseLike<AxiosResponse>) => void;
    reject: (reason?: any) => void;
    config: AxiosRequestConfig;
}[] = [];

const ISO_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

function normalizeDates<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;

    if (Array.isArray(obj)) {
        return obj.map(item => normalizeDates(item)) as unknown as T;
    }

    const out: any = {};
    for (const [ key, val ] of Object.entries(obj as any)) {
        // 1. Date instance
        if (val instanceof Date) {
            out[key] = format(val, "yyyy-MM-dd");
        }
        // 2. String matching ISO
        else if (typeof val === "string" && ISO_REGEX.test(val)) {
            const dt = parseISO(val);
            out[key] = isValid(dt) ? format(dt, "yyyy-MM-dd") : val;
        }
        // 3. Nested object/array
        else if (val && typeof val === "object") {
            out[key] = normalizeDates(val);
        }
        // 4. cualquier otro tipo
        else {
            out[key] = val;
        }
    }
    return out;
}

function isFormData(data: any): data is FormData {
    return typeof FormData !== "undefined" && data instanceof FormData;
}

/**
 * Axios request interceptor
 * Automatically injects Authorization headers using token from store
 */
axiosInstance.interceptors.request.use(
    async(conf: InternalAxiosRequestConfig) => {
        const storeUser = userDataConfig(pinia);
        const token = storeUser.userData;

        if (token.access) {
            conf.headers.authorization = `Bearer ${ token.access }`;
        } else {
            conf.headers.authorization = "";
        }

        if (conf.params) conf.params = normalizeDates(conf.params);
        if (conf.data && !isFormData(conf.data)) {
            conf.data = normalizeDates(conf.data);
        }

        return conf;
    },
    async(error) => await Promise.reject(error)
);

/**
 * Processes the failedQueue by iterating over each item and resolving or rejecting based on the provided error or token.
 *
 * @param {any} error - The error object used to reject the promises in the queue.
 * @param {string | null} [token=null] - An optional token used to update the Authorization header in the config for the requests.
 * @return {void} This function does not return a value.
 */
export function processQueue(error: any, token: string | null = null): void {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
            reject(error);
        } else {
            if (token && config.headers) {
                config.headers["Authorization"] = `Bearer ${ token }`;
            }
            resolve(axiosInstance(config));
        }
    });
    failedQueue = [];
}

function shouldAttemptRefresh(error: AxiosError, originalRequest: any): boolean {
    const status = error.response?.status;
    const isLoginOrPublic = originalRequest?.url?.includes("/api/login/");
    return status === 401 && !originalRequest._retry && !isLoginOrPublic;
}

async function handleTokenRefresh(originalRequest: any, error: AxiosError) {
    const storeUserInfo = userDataConfig(pinia);

    originalRequest._retry = true;

    if ( !storeUserInfo.userData?.refresh) {
        await storeUserInfo.logout();
        return Promise.reject(error);
    }

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
        });
    }

    isRefreshing = true;

    try {
        const newAccessToken = await storeUserInfo.refresh();
        authChannel.postMessage({ type: "REFRESHED", token: newAccessToken.access, refresh: newAccessToken.refresh });

        if (originalRequest.headers) originalRequest.headers["Authorization"] = `Bearer ${ newAccessToken.access }`;
        processQueue(null, newAccessToken.access);
        return axiosInstance(originalRequest);
    } catch (refreshError: any) {
        authChannel.postMessage({ type: "REFRESH_FAILED" });
        processQueue(refreshError, null);
        abortAllRequests();

        await storeUserInfo.logout();
        await handleServerError("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
        return Promise.reject(refreshError);
    } finally {
        isRefreshing = false;
    }
}

authChannel.onmessage = (event) => {
    const storeUserInfo = userDataConfig(pinia);
    const { token, refresh } = event.data;
    if (token) {
        storeUserInfo.userData = {
            ...storeUserInfo.userData,
            access: token,
            refresh: refresh?? storeUserInfo.userData.refresh
        };
        axiosInstance.defaults.headers["Authorization"] = `Bearer ${ token }`;
    }
};

async function handleServerSideError(error: AxiosError) {
    try {
        const contentType = error.response?.headers["content-type"];
        const data = error.response?.data;

        if (data && contentType?.includes("application/json")) {
            await handleServerError(data);
        } else if (data && contentType?.includes("text/html")) {
            let errorMessage = "Error en el servidor.";

            try {
                if (typeof data === "string") {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, "text/html");
                    const exception = doc.querySelector(".exception_value")?.textContent?.trim();
                    const pre = doc.querySelector("pre")?.textContent?.trim();
                    errorMessage = exception || pre || errorMessage;
                }
            } catch {
                showToast("error", "No se pudo procesar el mensaje.");
            }

            showToast("error", errorMessage);
        } else if (error.code === "ERR_NETWORK") {
            showToast("error", "No se pudo conectar al servidor.");
        }
    } catch (e) {
        console.error("Error al procesar el error del servidor:", e);
    }
}

/**
 * Handles errors encountered during Axios requests.
 * Includes logic for handling HTTP 401 (Unauthorized) errors by attempting token refresh,
 * processing error queues, and managing user session states.
 *
 * @param {AxiosError} error - The Axios error object resulting from a failed HTTP request.
 * @returns {Promise<any>} - A promise that resolves or rejects based on the error handling logic.
 *
 * Internal Logic:
 * - Identifies if the error is due to an unauthorized (401) status.
 * - Determines if retry attempts for token refresh should be made.
 * - Refreshes the access token via stored user information, if applicable.
 * - Re-processes failed requests in the queue after token refresh is successful.
 * - Handles cases where the refresh token is absent or expired by logging the user out.
 * - Processes server error responses with specific handling for JSON payloads and network errors.
 */
axiosInstance.interceptors.response.use(
    (response) => response,
    async(error: AxiosError): Promise<any> => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (shouldAttemptRefresh(error, originalRequest)) {
            return handleTokenRefresh(originalRequest, error);
        }

        await handleServerSideError(error);
        return Promise.reject(error);
    }
);

/**
 * Handles various server-side error response formats
 * Supports: string, array of messages, nested error objects, etc.
 *
 * @param errorData - Error payload returned by the server
 */
async function handleServerError(errorData: unknown): Promise<void> {
    if ( !errorData) {
        showToast("error", "Ocurrió un error inesperado.");
        return;
    }

    if (typeof errorData === "string") {
        showToast("error", errorData);
        return;
    }

    if (Array.isArray(errorData)) {
        errorData.forEach((err) => showToast("error", String(err)));
        return;
    }

    if (typeof errorData === "object") {
        const data = errorData as Record<string, any>;

        const extractMessages = (obj: any, keyPath = "") => {
            if (typeof obj === "string") {
                const prefix = keyPath ? `${ keyPath }: ` : "";
                showToast("error", `${ prefix }${ obj }`);
            } else if (Array.isArray(obj)) {
                obj.forEach((item) => extractMessages(item, keyPath));
            } else if (typeof obj === "object" && obj !== null) {
                Object.entries(obj).forEach(([ key, val ]) => {
                    const nextKeyPath = keyPath ? `${ keyPath }.${ key }` : key;
                    extractMessages(val, nextKeyPath);
                });
            }
        };

        if (data.errors) {
            extractMessages(data.errors);
        } else if (data.detail && Array.isArray(data.detail)) {
            data.detail.forEach((msg: any) => {
                showToast("error", typeof msg === "string" ? msg : String(msg?.msg || msg));
            });
        } else {
            extractMessages(data);
        }
        return;
    }

    showToast("error", "Error desconocido.");
}

/**
 * Displays a toast notification using PrimeVue's toast event bus
 *
 * @param severity - Notification type: success, info, warn, error
 * @param detail - Main message to display
 */
function showToast(severity: "success" | "info" | "warn" | "error", detail: string): void {
    toastEventBus.emit("add", { detail: detail, life: 5000, severity: severity, summary: "Server Error" });
}

/**
 * Shared interface for API requests
 */
interface ApiProps<T> extends AxiosRequestConfig {
    route: string;
    params?: Record<string, any>;
    responseType?: ResponseType;
    data?: T;
}

/**
 * Fetches data from a specified API route using a GET request.
 *
 * @param {ApiProps<any>} props - The properties for the API request including the route and parameters.
 * @param {string} props.route - The API route to make the GET request to.
 * @param {Record<string, any>} [props.params] - The optional query parameters to include in the GET request.
 * @return {Promise<{ response: AxiosResponse }>} A promise that resolves with the API response if successful.
 * @throws Will throw an error if the request fails, unless it is canceled.
 */
async function Get(props: ApiProps<any>): Promise<{ response: AxiosResponse | undefined }> {
    try {
        const response = await axiosInstance.get(`/api/${ props.route }/`, {
            ...props,
            signal: getAbortSignal()
        });
        return { response };
    } catch (error: any) {
        if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError" || error?.response?.status === 404) {
            if (error.response?.status === 404) {
                showToast("warn", `No se encontró el recurso: /api/${ props.route }/`);
            }
            return { response: undefined };
        }
        console.error(error);
        throw error;
    }
}

/**
 * POST request
 * @example
 * await Api.Post({ route: "auth/login", data: { username, password } });
 */
async function Post<T = any>(props: ApiProps<T>): Promise<{ response: AxiosResponse }> {
    try {
        const response = await axiosInstance.post<AxiosResponse>(`/api/${ props.route }/`, props.data, {
                params: props.params, responseType: props.responseType ?? "json"
            }
        );
        return { response };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * PUT request
 * @example
 * await Api.Put({ route: `user/update/1/`, data: { name } });
 */
async function Put(props: ApiProps<any>): Promise<{ response: AxiosResponse }> {
    try {
        const response = await axiosInstance.put<AxiosResponse>(`/api/${ props.route }/`, props.data);
        return { response };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * DELETE request
 * @example
 * await Api.Destroy({ route: "user/delete/1/", data: { name: 'any name' } });
 */
async function Destroy(props: ApiProps<any>): Promise<{ response: AxiosResponse }> {
    try {
        const response = await axiosInstance.delete<AxiosResponse>(`/api/${ props.route }/`, props.data);
        return { response };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * PATCH request
 * @example
 * await Api.Patch({ route: "invoice/update-status", data: { id, status } });
 */
async function Patch(props: ApiProps<any>): Promise<{ response: AxiosResponse }> {
    try {
        const response = await axiosInstance.patch<AxiosResponse>(`/api/${ props.route }/`, props.data);
        return { response };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * External GET request to fetch a currency rate list by route suffix
 * Uses public SUNAT API
 *
 * @example
 * await Api.getChangeList({ route: "?date=2025-04?skip=1" });
 */
async function getChangeList(props: ApiProps<any>): Promise<{ response: AxiosResponse }> {
    try {
        const response = await axios.get(`https://sunatrateapi.tsifactur.com/api/rate/list${ props.route }`, {
            params: props.params
        });

        return { response };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

/**
 * External GET request to fetch the latest currency rate
 *
 * @example
 * const { response } = await Api.getRateLast();
 */
async function getRateLast(): Promise<{ response: AxiosResponse }> {
    try {
        const response = await axios.get(`https://sunatrateapi.tsifactur.com/api/rate/last`);
        return { response };
    } catch (error) {
        console.log(error);
        throw error;
    }
}

// Exporting API methods
export const Api = { Get, Post, Put, Destroy, Patch, getChangeList, getRateLast };
