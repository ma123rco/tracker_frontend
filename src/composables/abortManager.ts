let controller = new AbortController();

/**
 * Returns the abort signal associated with the global controller.
 *
 * This signal can be used to monitor or control the cancellation of an operation.
 *
 * @return {AbortSignal} The signal from the global controller, used for aborting operations.
 */
export function getAbortSignal(): AbortSignal {
    return controller.signal;
}

/**
 * Aborts all ongoing requests by signaling a request abortion to the global abort controller
 * and initializes a new abort controller for future requests.
 *
 * @return {void} This method does not return a value.
 */
export function abortAllRequests(): void {
    controller.abort();
    controller = new AbortController();
}
