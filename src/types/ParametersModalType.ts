import type { Component, VNode } from "vue";
import type { DialogBreakpoints } from "primevue/dialog";
import type { HintedString } from "@primevue/core";

export type ModalParameters = {
    /**
     * @params {Function} - Function that returns a component
     * @description CallBack to function when modal is closed.
     */
    afterClose?: () => void;
    /**
     *  @params {object} - default value.
     *  @description Create options to manage the breakpoints of modal.
     */
    breakpoints?: DialogBreakpoints;
    /**
     * @params {Component} - Function that returns a component
     * @description Component of the modal.
     */
    component: VNode | Record<string, any>;
    /**
     * Specifies if clicking the modal background should hide the dialog.
     * @default false
     */
    dismissableMask?: boolean;
    /**
     * @params {Component} - Function that returns a component
     * @description Component of footer modal.
     */
    footer?: string | null;
    /**
     *  @params {string} - default value.
     *  @description Title of the modal.
     */
    header: string;
    /**
     *  @params {boolean} - default value.
     *  @description Whether to a modal layer behind the drawer.
     */
    modal?: boolean;
    /**
     *  @params {object} - default value.
     *  @description Create options to manage the breakpoints of modal.
     */
    position?: HintedString<"center" | "top" | "bottom" | "left" | "right" | "topleft" | "topright" | "bottomleft" | "bottomright"> | undefined
    /**
     * Slots personalizados para el modal.
     * Cada slot puede inyectar un componente dinámico con `h()`.
     */
    slots?: {
        default?: VNode | Component | Record<string, any>;
        header?: VNode | Component | Record<string, any>;
        footer?: VNode | Component | Record<string, any>;
        closebutton?: VNode | Component | Record<string, any>;
        closeicon?: VNode | Component | Record<string, any>;
        maximizebutton?: VNode | Component | Record<string, any>;
        maximizeicon?: VNode | Component | Record<string, any>;
    }
    /**
     * @params {boolean} false - default value.
     * @description Visible of the modal.
     */
    visible: boolean
    /**
     *  @params {string} - default value.
     *  @description Size of the modal.
     */
    width: string
    /**
     * @params {Boolean} - Value to show the footer section in the modal
     * @description Boolean to show footer
     */
    withTeleport?: boolean;
    /**
     *  @params {object} - default value.
     *  @description Create options to manage the breakpoints of modal.
     */
    zIndex?: number;
};
