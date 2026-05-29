<script setup lang="ts">

import { computed } from "vue";
import router from "@/router";
import { userDataConfig } from "@/store/layout/storeUserData.ts";
import useGlobalToast from "@/composables/toastEvent.ts";

const useUserDataConfig = userDataConfig();
const isLogged = computed(() => !!useUserDataConfig.userData?.token);

const backToDefaultRoute = async() => {
    try {
        const user = useUserDataConfig.userData?.user;
        if ( !user?.id) {
            await useUserDataConfig.logout();
            useGlobalToast({ severity: "warn", message: "Su sesión ha expirado" });
        }
        if (['gerente', 'admin'].includes(useUserDataConfig.userData?.user?.role)) {
            await router.push({ name: "home" });
            return;
        }
        await router.push({ name: "home" });
    } catch (e) {
        console.error(e);
        await useUserDataConfig.logout();
    }
};

</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat"
         style="background-image: url('https://wallpapershome.com/images/pages/pic_h/27258.jpg')">
        <div class="mx-2 max-w-md rounded-lg bg-white bg-opacity-90 p-4 text-center shadow-lg space-y-4 text-surface-900 dark:bg-surface-900 dark:text-surface-100">
            <img src="@/assets/forbidden.svg" alt="forbidden page or content">
            <h1 class="text-center text-3xl font-medium"> Acceso no permitido </h1>
            <p class="text-center text-xl text-surface-700 dark:text-surface-400">
                Has intentado acceder a una página para la que no tienes permisos.
            </p>
            <RouterLink v-if="!isLogged" to="/login" class="mt-6 text-blue-600 hover:underline">
                Iniciar sesión
            </RouterLink>
            <Button fluid label="Regresar al inicio" v-else @click="backToDefaultRoute()"/>
        </div>
    </div>
</template>
