<script setup lang="ts" id="abc">
import router from "@/router";
import { navBarStore } from "@/store/layout/optionsMenu.ts";
import { userDataConfig } from "@/store/layout/storeUserData.ts";
import { pinia } from "@/pinia.ts";
import { useRoute } from "vue-router";
import { h, ref } from "vue";
import { useDark, useToggle } from "@vueuse/core";
import { useModal } from "@/composables/useModal.ts";
import type { MenuItem } from "primevue/menuitem";
import ChangePassword from "@/components/ChangePassword.vue";

const isDark = useDark({ disableTransition: false, initialValue: "light" });
const menu = ref();
const useNavBarStore = navBarStore();
const storeUserInfo = userDataConfig(pinia);

const { closeModal, openModal } = useModal();
const toggleDark = useToggle(isDark);
const route = useRoute();

/**
 * create an arrow function to determinate if the route is active
 * @param parentKey
 */
const parentActive = (parentKey: string): boolean => {
    return route.name === parentKey;
};

/**
 * create an arrow function to determinate if the items is an active child route
 * @param childrenRoutes
 */
const isChildActive = (childrenRoutes: MenuItem[]): boolean => {
    return childrenRoutes.some((child) => {
        return route.name === child.key;
    });
};

const items = ref([
    { class: IconMaterialSymbolsPartlyCloudyNightRounded, command: () => toggleDark(), label: "Modo oscuro" },
    {
        class: IconMaterialSymbolsPasswordRounded, command: () => {
            openModal({
                component: h(ChangePassword, {
                    userID: storeUserInfo.userData?.user?.id,
                    closeForm: () => closeModal()
                }),
                header: "Cambiar contraseña"
            });

        }, label: "Cambiar contraseña"
    },
    { class: IconMaterialSymbolsMobileArrowRightOutline, command: async() => await storeUserInfo.logout(), label: "Cerrar sesión" }
]);

const toggle = (event: MouseEvent) => {
    menu.value.toggle(event);
};

useNavBarStore.createOptionsMenu();

</script>

<template>
    <Menubar :model="useNavBarStore.options" class="sticky top-0 bottom-2 z-50 mx-2" breakpoint="840px">
        <template #start>
            <i-material-symbols-local-fire-department-rounded class="text-2xl text-primary-500"/>
        </template>
        <template #item="{ item, props }">
            <RouterLink v-if="item.route && !item.items" v-slot="{ href, navigate }" :to="item.route" custom>
                <a :href v-bind="props.action" @click="navigate"
                   :class="`rounded ${parentActive(item?.key!) ? ' bg-primary-400 text-white!' : ''}`" v-ripple>
                    <Component :is="item?.icon" v-if="item?.icon"/>
                    <span>{{ item.label }}</span>
                </a>
            </RouterLink>
            <a v-else v-ripple v-bind="props.action"
               :class="`rounded ${isChildActive(item.items || []) ? ' bg-primary-400 text-white!' :''}`">
                <Component :is="item?.icon" v-if="item?.icon"/>
                <span>{{ item.label }}</span>
                <i-material-symbols-keyboard-arrow-down-rounded/>
            </a>
        </template>
        <template #end>
            <div class="flex items-center gap-2">
                <Button :label="`${ storeUserInfo.userData.user?.names || '-' }`" @click="toggle" aria-haspopup="true"
                        aria-controls="overlay_menu" #icon>
                    <i-material-symbols-frame-person-rounded/>
                </Button>
                <TieredMenu ref="menu" id="overlay_menu" :model="items" popup #itemicon="{ item }">
                    <component :is="item.class"/>
                </TieredMenu>
                <Button @click="router.push({ name: 'webPage' })" rounded severity="contrast" v-tooltip="'Regresar a la web'" #icon>
                    <i-material-symbols-arrow-back-rounded/>
                </Button>
            </div>
        </template>
    </Menubar>
</template>
