import router from "@/router/index";
import { authChannel } from "@/api/authChannel.ts";
import { abortAllRequests } from "@/composables/abortManager.ts";
import { defineStore } from "pinia";
import { ResetPinia } from "@/composables/resetPiniaStore.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { InterfaceLogin } from "@/types/settings/InterfaceLogin.ts";
import type { PermissionsInfo } from "@/types/settings/DataPermissions.ts";

export const userDataConfig = defineStore("userDataConfig", {
    state: () => ({
        userData: {} as InterfaceLogin
    }),
    actions: {
        /**
         * Logs in a user with the provided login data and redirects to the first valid route.
         *
         * @param {InterfaceLogin} data - The login data required for user authentication.
         * @return {Promise<void>} A promise that resolves once the user data is processed and navigation is completed.
         */
        async loginUserData(data: InterfaceLogin): Promise<void> {
            if ( !data.token) throw new Error("No access or refresh token");
            if ( !data.user.id) throw new Error("No user data");
            if (data.token) this.userData = { ...data, user: data.user };
            useGlobalToast({ summary: `Bienvenido ${ this.userData.user?.names } ${ this.userData.user?.names } ` });
            await router.push({ name: "home" });
            authChannel.postMessage({ type: "LOGIN", token: data.token, data });
        },

        /**
         * Logs out the current user by clearing user data, clearing the session storage,
         * and redirecting the user to the login page.
         *
         * @return {Promise<void>} A promise that resolves once the logout process is complete.
         */
        async logout(): Promise<void> {
            this.userData = {} as InterfaceLogin;
            sessionStorage.clear();
            ResetPinia();
            abortAllRequests();

            if (router.currentRoute.value.name !== "login") {
                await router.push({ name: "login" });
            }
            authChannel.postMessage({ type: "LOGOUT" });
        },

        /**
         * Validates whether a given permission exists for a specified route name.
         * Searches through user permissions and nested route data to determine token.
         *
         * @param {string} routeName - The name of the route to check.
         * @param permName
         * @param routes
         * @return {boolean} Returns true if the permission exists for the given route, otherwise false.
         */
        hasRoutePermission(routeName: string, permName: string, routes: PermissionsInfo[] = []): boolean {
            const perm = permName.trim().toLowerCase();

            return routes.some(route => {
                if (route.name === routeName) {
                    const routePerms: string[] = route.meta?.permissions ?? route.permissions ?? [];
                    return routePerms.some(p => p.trim().toLowerCase() === perm);
                }
                return route.children ? this.hasRoutePermission(routeName, permName, route.children) : false;
            });
        }
    }
});
