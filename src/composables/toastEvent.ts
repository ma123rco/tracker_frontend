import toastEventBus from "primevue/toasteventbus";
import type { HintedString } from "@primevue/core";

interface ToastOptions {
    message?: string | "";
    severity?: HintedString<"success" | "info" | "warn" | "error" | "secondary" | "contrast"> | undefined;
    life?: number | 5000;
    summary?: string | "";
    closable?: boolean | true;
}

const useGlobalToast = (data: ToastOptions): void => {
    toastEventBus.emit("add", { ...data, detail: data.message, life: data.life || 5000 });
};

export default useGlobalToast;
