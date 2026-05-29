import { ref } from "vue";
import type { DrawerParametersInterface } from "@/types/DrawerParametersInterface.ts";

const drawerOptions = ref<DrawerParametersInterface>({
    show: false,
    header: "",
    component: {},
    modal: true,
    position: "right",
    size: "w-[30rem]"
});

const openDrawer = (options: Partial<DrawerParametersInterface>) => {
    Object.assign(drawerOptions.value, options, { show: true });
};

const closeDrawer = () => {
    drawerOptions.value.show = false;
};

export function useDrawer() {
    return {
        drawerOptions,
        openDrawer,
        closeDrawer
    };
}
