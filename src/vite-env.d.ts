/// <reference types="vite/client" />
/// <reference types="unplugin-icons/types/vue3" />
/// <reference path="../auto-imports.d.ts" />
/// <reference path="../components.d.ts" />

declare module "~icons/*" {
    import type { FunctionalComponent, SVGAttributes } from "vue";
    const component: FunctionalComponent<SVGAttributes>;
    export default component;
}