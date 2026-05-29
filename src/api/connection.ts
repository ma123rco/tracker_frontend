import toastEventBus from "primevue/toasteventbus";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig, ResponseType } from "axios";
import axios, { type AxiosRequestConfig } from "axios";
import { userDataConfig } from "@/store/layout/storeUserData";
import { abortAllRequests, getAbortSignal } from "@/composables/abortManager.ts";
import { pinia } from "@/pinia.ts";
import { format, isValid, parseISO } from "date-fns";
import { authChannel } from "@/api/authChannel.ts";

// Base URL taken from an environment variable
let baseURL: string = import.meta.env.VITE_API_URL;
export const axiosInstance = axios.create({ baseURL });

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
axiosInstance.interceptors.request.use((conf: InternalAxiosRequestConfig) => {
        const storeUser = userDataConfig(pinia);
        const token = storeUser.userData?.token;

        if (token) {
            conf.headers.authorization = `Bearer ${ token }`;
        } else {
            delete conf.headers.authorization;
        }

        if (conf.params) conf.params = normalizeDates(conf.params);
        if (conf.data && !isFormData(conf.data)) {
            conf.data = normalizeDates(conf.data);
        }

        return conf;
    }, (error) => Promise.reject(error)
);

authChannel.onmessage = (event) => {
    const storeUserInfo = userDataConfig(pinia);
    const { token, refresh } = event.data;
    if (token) {
        storeUserInfo.userData = {
            ...storeUserInfo.userData,
            token: refresh ?? storeUserInfo.userData.token
        };
        axiosInstance.defaults.headers["Authorization"] = `Bearer ${ token }`;
    }
};

async function handleServerSideError(error: AxiosError) {
    try {
        const headerContentType = error.response?.headers["content-type"];
        const contentType = typeof headerContentType === "string"
                            ? headerContentType : Array.isArray(headerContentType)
                                                  ? headerContentType.join("; ") : "";

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
axiosInstance.interceptors.response.use((response) => response, async(error: AxiosError) => {
    const storeUserInfo = userDataConfig(pinia);
    const status = error.response?.status;
    // @ts-ignore
    if (status === 403 && error.response?.data?.error !== "Forbidden") {
        abortAllRequests();
        await storeUserInfo.logout();
        showToast("warn", "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        return Promise.reject(error);
    }

    await handleServerSideError(error);
    return Promise.reject(error);
});

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

// Exporting API methods
export const Api = { Get, Post, Put, Destroy, Patch };
