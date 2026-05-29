<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";
import { useForm } from "vee-validate";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import { ref } from "vue";
import useGlobalToast from "@/composables/toastEvent.ts";
import * as yup from "yup";

const loading = ref(false);

const validationSchema = yup.object({
    email: yup.string().email("Correo inválido").required("El correo es obligatorio"),
    message: yup.string().required("El mensaje es obligatorio").min(5, "El mensaje debe tener al menos 8 caracteres"),
    full_name: yup.string().required("El nombre es obligatorio").min(3, "Debe tener al menos 3 caracteres"),
    phone: yup.string().required("El telefono es obligatorio").min(7, "El mensaje debe tener al menos 8 caracteres"),
    subject: yup.string().required("Seleccione un asunto")
});

const { handleSubmit, defineField, resetForm } = useForm({ validationSchema });

const [ name, nameProps ] = defineField("full_name");
const [ email, emailProps ] = defineField("email");
const [ phone, phoneProps ] = defineField("phone");
const [ subject, subjectProps ] = defineField("subject");
const [ message, messageProps ] = defineField("message");

const subjects = [
    { label: "Consulta General", value: "Consulta General" },
    { label: "Soporte técnico", value: "Soporte Tecnico" },
    { label: "Ventas y Presupuestos", value: "Ventas y presupuestos" },
    { label: "Otros", value: "Otros" }
];

const onSaveContact = handleSubmit(async(values) => {
    try {

        loading.value = true;
        const { response } = await Api.Post({ route: "contacts", data: values });
        if (response && [ 200, 201 ].includes(response.status)) {
            useGlobalToast({ life: 15000, severity: "success", summary: "¡¡¡Solicitud enviada, lo atenderemos lo mas pronto posible!!!" });
            resetForm();
            loading.value = false;
        }
    } catch (e) {
        loading.value = false;
        console.error(e);
        useGlobalToast({ summary: `Error al enviar el mensaje :"(`, severity: "error" });
    }
}, ({ errors }) => castFormErrors(errors));

</script>

<template>
    <main class="flex-1 max-w-300 mx-auto w-full px-6 py-10">
        <div class="mb-12">
            <h1 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Contáctanos</h1>
            <p class="text-slate-600 dark:text-slate-400 max-w-xl">
                Estamos aquí para ayudarte. Encuentra nuestras oficinas o envíanos un mensaje directo.
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div class="lg:col-span-5 flex flex-col gap-8">
                <section>
                    <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                        <i-material-symbols-chat-bubble-outline-rounded class="text-primary"/>
                        Envíanos un mensaje
                    </h2>
                    <div class="align-items-form">
                        <ValidateFormItem span="6" label="Nombre completo" name="full_name" v-slot="{ error }" mark>
                            <InputText v-model="name" v-bind="nameProps" :invalid="!!error" placeholder="Tu nombre" fluid/>
                        </ValidateFormItem>

                        <ValidateFormItem span="6" label="Correo electrónico" v-slot="{ error }" name="email" mark>
                            <InputText v-model="email" v-bind="emailProps" :invalid="!!error" placeholder="ejemplo@correo.com" fluid/>
                        </ValidateFormItem>
                        <ValidateFormItem span="6" label="Teléfono" v-slot="{ error }" name="phone" mark>
                            <InputText v-model="phone" v-bind="phoneProps" placeholder="Tu teléfono" :invalid="!!error" fluid/>
                        </ValidateFormItem>
                        <ValidateFormItem span="6" label="Asunto" v-slot="{ error }" name="subject" mark>
                            <Select v-model="subject" v-bind="subjectProps" :options="subjects" optionLabel="label" optionValue="value"
                                    placeholder="Seleccione un asunto" :invalid="!!error" fluid/>
                        </ValidateFormItem>
                        <ValidateFormItem span="12" label="Mensaje" v-slot="{ error }" name="message" mark>
                            <Textarea v-model="message" v-bind="messageProps" rows="4" :invalid="!!error"
                                      placeholder="Escribe tu mensaje aquí..." fluid/>
                        </ValidateFormItem>
                    </div>
                    <Button fluid size="large" label="Enviar mensaje" @click="onSaveContact()" :loading/>
                </section>
            </div>

            <div class="lg:col-span-7 flex flex-col gap-4">
                <h2 class="text-2xl font-bold flex items-center gap-2">
                    <i-material-symbols-location-on class="text-primary"/>
                    Nuestra Ubicación
                </h2>
                <div class="relative w-full h-125 rounded-2xl overflow-hidden shadow-xl border border-primary/20 bg-slate-200 dark:bg-slate-800">
                    <LMap ref="map" style="height:100%; width:100%" :zoom="18" :max-zoom="18" :center="[-17.389707, -66.166301]">
                        <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"/>
                        <LMarker draggable :lat-lng="[-17.389707, -66.166301]"/>
                    </LMap>
                </div>
            </div>
        </div>
    </main>
</template>
