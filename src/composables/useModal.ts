import { ref } from "vue";
import type { ModalParameters } from "@/types/ParametersModalType.ts";

const defaultModalOptions: ModalParameters = {
    breakpoints: { "1100px": "70vw", "950px": "90vw", "640px": "95vw" },
    component: {},
    dismissableMask: false,
    header: "",
    modal: true,
    slots: {},
    visible: false,
    width: "50vw",
    withTeleport: false
};

const stack = ref<ModalParameters[]>([]);

export function useModal() {

    let zIndexCounter = 2000;

    const openModal = (options: Partial<ModalParameters> = {}) => {
        const modalData: ModalParameters = { ...defaultModalOptions, ...options, zIndex: zIndexCounter++ };
        const existing = stack.value.find(m => m.component.type === modalData.component.type);

        if (existing) {
            existing.component.props = { ...existing.component.props, ...modalData.component.props };
            existing.header = modalData.header ?? existing.header;
            existing.width = modalData.width ?? existing.width;
            existing.visible = true;

            return;
        }

        stack.value.push(modalData);
        modalData.visible = true;
    };

    const closeModal = (force = false) => {
        if (force) {
            stack.value = [];
            return;
        }

        const last = stack.value.pop();
        if (last) last.visible = false;
    };

    return { stack, openModal, closeModal };
}
