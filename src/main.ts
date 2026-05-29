import "./style.css";
import router from "./router/index";
import PrimeVue from "primevue/config";
import { Tooltip, AnimateOnScroll, BadgeDirective, ConfirmationService, DialogService, FocusTrap, Ripple, StyleClass, ToastService, KeyFilter } from "primevue";
import { pinia } from "@/pinia.ts";
import { createApp } from "vue";
import { createPersistedState } from "pinia-plugin-persistedstate";

import CryptoJS from "crypto-js";
import App from "./App.vue";

const SECRET_KEY = "JoshelitoElTravieso";
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

app.directive("tooltip", Tooltip);
app.directive("badge", BadgeDirective);
app.directive("ripple", Ripple);
app.directive("styleclass", StyleClass);
app.directive("focustrap", FocusTrap);
app.directive("animateonscroll", AnimateOnScroll);
app.directive("keyFilter", KeyFilter);

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
    theme: "none"
});

app.use(pinia);
app.use(ConfirmationService);
app.use(ToastService);
app.use(DialogService);
app.use(router);

app.mount("#app");
