import type { AxiosResponseHeaders, InternalAxiosRequestConfig, RawAxiosResponseHeaders } from "axios";

/**
 * Generic interface for an Axios API response containing an array of data.
 *
 * @template T - The type of data returned by the API, use when the response is not paginated.
 */
export interface InterfaceAxiosApi<T> {
    response: Response<T> | undefined;
}

/**
 * Generic interface for an Axios API response containing a single data object,
 * typically used for POST or PUT operations.
 *
 * @template T - The type of the returned data object.
 */
export interface InterfaceAxiosApiResponse<T> {
    response: ResponsePostPut<T> | undefined;
}

/**
 * Represents a standard Axios response object for POST or PUT requests.
 *
 * @template T - The type of the data returned by the API.
 */
export interface ResponsePostPut<T> {
    /** Axios request configuration used in the request. */
    config: InternalAxiosRequestConfig;

    /** The response data of type `T`. */
    data: T;

    /** Response headers returned by the server. */
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;

    /** The original request object (optional). */
    request?: any;

    /** HTTP status code of the response. */
    status: number;

    /** HTTP status text of the response (e.g., "OK"). */
    statusText: string;
}

/**
 * Represents a standard Axios response object for GET requests that return an array.
 *
 * @template T - The type of data items returned by the API.
 */
export interface Response<T> {
    /** Axios request configuration used in the request. */
    config: InternalAxiosRequestConfig;

    /** Array of response data items. */
    data: T[];

    /** Response headers returned by the server. */
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;

    /** The original request object (optional). */
    request?: any;

    /** HTTP status code of the response. */
    status: number;

    /** HTTP status text of the response (e.g., "OK"). */
    statusText: string;
}

/**
 * Interface for a paginated Axios API response.
 *
 * @template T - The type of items in the paginated results.
 */
export interface InterfaceAxiosApiPaginate<T> {
    response: ResponseGet<T> | undefined;
}

/**
 * Represents an Axios response object for paginated GET requests.
 *
 * @template T - The type of items in the paginated response.
 */
export interface ResponseGet<T> {
    /** The data payload containing pagination info and results. */
    data: Data<T>;

    /** HTTP status code of the response. */
    status: number;

    /** HTTP status text of the response (e.g., "OK"). */
    statusText: string;

    /** Response headers returned by the server. */
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;

    /** Axios request configuration used in the request. */
    config: InternalAxiosRequestConfig;

    /** The original request object (optional). */
    request?: any;
}

/**
 * Structure of a paginated dataset returned from an API.
 *
 * @template T - The type of items contained in the result array.
 */
export interface Data<T> {
    /** Array of items with the type `T` for the current page. */
    data: T[];

    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}
