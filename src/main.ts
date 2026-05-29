import "./style.css";
import router from "./router/index";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import reveal from "@/composables/reveal"
import { Tooltip, BadgeDirective, ConfirmationService, DialogService, FocusTrap, Ripple, ToastService, KeyFilter } from "primevue";
import { pinia } from "@/pinia.ts";
import { createApp } from "vue";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { definePreset } from "@primeuix/themes";
import "@/assets/primevue/datatable.css";
import "@/assets/primevue/paginator.css";

import CryptoJS from "crypto-js";
import App from "./App.vue";
import ValidateFormItem from "@/components/ValidateFormItem.vue";
import EmptyTable from "@/components/emptyTable.vue";
import LoadingPage from "@/components/loadingPage.vue";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
const app = createApp(App);

pinia.use(createPersistedState({
    auto: true,
    serializer: {
        serialize: (value) => {
            return CryptoJS.AES.encrypt(JSON.stringify(value), SECRET_KEY).toString();
        },
        deserialize: (value) => {
            try {
                const bytes = CryptoJS.AES.decrypt(value, SECRET_KEY);
                const decrypted = bytes.toString(CryptoJS.enc.Utf8);
                return JSON.parse(decrypted);
            } catch (err) {
                console.error("Error al desencriptar los datos:", err);
                return {};
            }
        }
    }
}));

app.component("loadingPage", LoadingPage);
app.component("emptyTable", EmptyTable);
app.component("ValidateFormItem", ValidateFormItem);

app.directive("tooltip", Tooltip);
app.directive("badge", BadgeDirective);
app.directive("ripple", Ripple);
app.directive("focustrap", FocusTrap);
app.directive("keyFilter", KeyFilter);
app.directive("reveal", reveal)

const stylePreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: "#FFF7ED",
            100: "#FFEDD5",
            200: "#FED7AA",
            300: "#FDBA74",
            400: "#FB923C",
            500: "#F97316",
            600: "#EA580C",
            700: "#C2410C",
            800: "#9A3412",
            900: "#7C2D12",
            950: "#431407"
        },
        colorScheme: {
            dark: {
                surface: {
                    0: "#FFFFFF",
                    50: "#F9FAFB",
                    100: "#F3F4F6",
                    200: "#E5E7EB",
                    300: "#D1D5DB",
                    400: "#9CA3AF",
                    500: "#6B7280",
                    600: "#4B5563",
                    700: "#374151",
                    800: "#1F2937",
                    900: "#111827",
                    950: "#03070F"
                }
            }
        }
    }
});

app.use(PrimeVue, {
    locale: {
        choose: "Seleccionar",
        dateFormat: "dd-mm-yy",
        dayNames: [ "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado" ],
        dayNamesMin: [ "Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa" ],
        dayNamesShort: [ "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab" ],
        emptyMessage: "No hay opciones disponibles",
        emptySearchMessage: "Sin datos encontrados",
        fileChosenMessage: "{0} Seleccionados",
        firstDayOfWeek: 1,
        invalidFileTypeMessage: "Archivo no valido",
        monthNames: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
            "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre" ],
        monthNamesShort: [ "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" ],
        noFileChosenMessage: "Seleccione un archivo",
        today: "Hoy",
        weekHeader: "Sem"
    },
    pt: {
        DataTable: {
            root: {
                class: "p-datatable-striped"
            }
        }
    },
    ripple: true,
    theme: {
        preset: stylePreset,
        options: {
            darkModeSelector: ".dark",
            cssLayer: false
        }
    }
});

app.use(pinia);
app.use(ConfirmationService);
app.use(ToastService);
app.use(DialogService);
app.use(router);

app.mount("#app");
