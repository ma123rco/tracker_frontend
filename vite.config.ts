import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import { PrimeVueResolver } from "@primevue/auto-import-resolver";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import Icons from "unplugin-icons/vite";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import IconsResolver from "unplugin-icons/resolver";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        Components({
            resolvers: [
                IconsResolver(),
                PrimeVueResolver()
            ]
        }),
        Icons({
            autoInstall: true,
            compiler: "vue3"
        }),
        AutoImport({
            dts: "./auto-imports.d.ts",
            resolvers: [ IconsResolver({ prefix: "Icon" }) ]
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url))
        }
    },
    server: {
        host: true,
        port: 3000
    }
});
