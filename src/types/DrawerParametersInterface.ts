import type { VNode } from "vue";

export interface DrawerParametersInterface {
    /**
     * A tailwind class for to add size
     */
    size?: string;
    /**
     * Represents a variable component that can either be a virtual node (VNode)
     * or a record object with string keys and values of any type.
     * This component allows dynamic assignment of either a VNode instance
     * or a key-value pair object structure.
     *
     * @type {VNode | Record<string, any>}
     */
    component: VNode | Record<string, any>,
    /**
     * Title of the Drawer
     */
    header: string,
    position?: "top" | "bottom" | "left" | "right",
    modal?: boolean,

    /**
     * A callback function that is executed after a hide action has completed.
     * This function does not take any arguments and does not return a value.
     */
    onAfterHide?: () => void;
    /**
     * A callback function executed immediately after the component or element is shown.
     * This can be used to perform actions or trigger events once the visibility change is complete.
     * The function does not accept any arguments and does not return any value.
     */
    onAfterShow?: () => void;
    /**
     * A callback function that is triggered before an element is hidden.
     * This function is optional and can be used to perform custom logic
     * or cleanup operations just before the hiding action occurs.
     */
    onBeforeHide?: () => void;
    /**
     * Boolean for show the drawer
     * @default false
     */
    show: boolean;
}