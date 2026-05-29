import router from "@/router/index.ts";
import { userDataConfig } from "./storeUserData.ts";
import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";
import { pinia } from "@/pinia.ts";

interface RouteMeta {
    allowedRole?: string[];
    icon?: string;
    isNotMenu?: boolean;
    label?: string;
    separator?: boolean;
}

interface Option {
    active: string;
    expand?: boolean;
    icon?: string;
    items?: Option[];
    key: string;
    label?: string;
    meta: RouteMeta;
    path?: string;
    route?: string;
    separator?: boolean;
    visible: boolean;
}

const store = userDataConfig(pinia);

export const navBarStore = defineStore("optionsMenu", {
    state: () => ({ options: [] as Option[] }),
    actions: {
        hasAccessByRole(route: RouteRecordRaw): boolean {
            const userRole = store.userData?.user?.role;
            const allowedRoles = route.meta?.allowedRole as string[] | undefined;

            if ( !allowedRoles || !userRole) return false;

            return allowedRoles.includes(userRole);
        },

        /**
         * Creates the option menu by resolving router views and processing the routes.
         * This method retrieves the child routes of the "home" route, if available,
         * and generates options from the resolved routes.
         *
         * @return {Promise<void>} A promise that resolves once the option menu has been created.
         */
        async createOptionsMenu(): Promise<void> {
            const routerViews: RouteRecordRaw[] = router?.resolve({ name: "home" })?.matched[0]?.children || [];
            this.options = this.processRoutes(routerViews);
        },
        /**
         * Determines if the given path contains any required parameters.
         *
         * @param {string} path - The input path string that may contain parameters.
         * @return {boolean} Returns true if there are required parameters in the path, otherwise false.
         */
        hasRequiredParams(path: string): boolean {
            const matches = [ ...path.matchAll(/:(\w+)(\?)?/g) ];
            return matches.some(([ , , optional ]) => !optional);
        },
        /**
         * Processes an array of route records to extract specific options based on route metadata.
         *
         * @param {RouteRecordRaw[]} routes - An array of route record objects to be processed.
         * @return {Option[]} An array of processed options derived from the provided route records.
         */
        processRoutes(routes: RouteRecordRaw[]): Option[] {
            return routes.reduce((processedRoutes: Option[], route: RouteRecordRaw) => {
                if (route.meta && "label" in route.meta) {
                    const processedRoute: Option | null = this.valuesRoutesMenu(route);
                    if (processedRoute) {
                        processedRoutes.push(processedRoute);
                        if (route.meta?.separator) {
                            processedRoutes.push({ separator: true } as unknown as Option);
                        }
                    }
                }
                return processedRoutes;
            }, []);
        },
        /**
         * Processes a route record and generates an option object for a route menu.
         *
         * @param {RouteRecordRaw} route - The route record to process, which contains metadata, path, name, and children.
         * @return {Option | null} Returns an Option object if the route can be included in the menu,
         * or null if the route is not valid for the menu.
         */
        valuesRoutesMenu(route: RouteRecordRaw): Option | null {

            if ( !route.meta || !("label" in route.meta)) return null;
            if ( !this.hasAccessByRole(route)) return null;

            const meta = route.meta as RouteMeta;

            const objOption: Option = {
                active: route.name as string,
                icon: meta.icon,
                key: route.name as string,
                label: meta.label,
                meta,
                visible: true
            };

            const isDynamic = route.path.includes(":");
            const hasRequired = this.hasRequiredParams(route.path);

            if ( !isDynamic) {
                objOption.route = route.path;
                objOption.path = route.path;
            } else if ( !hasRequired) {
                const resolved = router.resolve({ name: route.name as string, params: {} });
                objOption.route = resolved.fullPath;
                objOption.path = resolved.path;
            } else {
                return null;
            }

            if (route.children && !meta.isNotMenu) {
                objOption.items = this.processRoutes(route.children);
                objOption.expand = false;

                return objOption.items.length ? objOption : null;
            }

            return objOption;
        }
    }
});
