<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { useForm } from "vee-validate";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { UserInterface } from "@/types/UsersInterface.ts";
import * as yup from "yup";
import { onMounted, ref } from "vue";

const props = defineProps<{ closeModal: () => void, reloadData: () => Promise<void>, form?: UserInterface }>();

type UserFormValues = Partial<UserInterface> & { password?: string };

const loading = ref(false);

const validationSchema = ref(yup.object({
    password: yup.string().trim().when("$isNew", {
        is: () => !props.form?.id,
        then: (schema) => schema.required("Ingrese su contraseña").min(3, "Ingresa al menos 3 caracteres"),
        otherwise: (schema) => schema.notRequired()
    }).label("Contraseña"),
    role: yup.string().required("Seleccione un rol"),
    names: yup.string().required("Ingrese un nombre"),
    ci: yup.string().required("Ingrese una cedula"),
    lastnames: yup.string().required("Ingrese un apellido"),
    username: yup.string().required("Agregue un usuario")
}));

const optionsRole = [
    { label: "Gerente", value: "Gerente" },
    { label: "Secretaria", value: "Usuario" },
    { label: "Tecnico", value: "Tecnico" }
];

const { handleSubmit, setValues, values } = useForm<UserFormValues>({ validationSchema });

const onCreate = handleSubmit(async(values) => {
    try {
        loading.value = true;
        const isEdit = values?.id;
        const route = isEdit ? `users/${ values.id }` : "users/register";
        const method = isEdit ? Api.Put : Api.Post;
        const { response } = await method({ route, data: { ...values } });

        if (response && [ 200, 201 ].includes(response.status)) {
            props.closeModal();
            await props.reloadData();
        }
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}, ({ errors }) => castFormErrors(errors));

onMounted(() => {
    if (props.form?.id) setValues({ ...props.form });
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem name="ci" label="Cedula" span="3" mark v-slot="{ value, handleChange, error, id }">
            <InputText :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id" v-key-filter.alphanum/>
        </ValidateFormItem>
        <ValidateFormItem name="names" label="Nombre" span="4" mark v-slot="{ value, handleChange, error, id }">
            <InputText :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id"/>
        </ValidateFormItem>
        <ValidateFormItem name="lastnames" label="Apellidos" span="5" mark v-slot="{ value, handleChange, error, id }">
            <InputText :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id"/>
        </ValidateFormItem>
        <ValidateFormItem name="role" label="Perfil" span="4" mark v-slot="{ value, handleChange, error, id }">
            <Select :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :labelId="id" :options="optionsRole"
                    optionLabel="label" optionValue="value"/>
        </ValidateFormItem>
        <ValidateFormItem name="username" label="Usuario" span="4" mark v-slot="{ value, handleChange, error, id }" v-if="!props.form?.id">
            <InputText :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id" maxlength="20"/>
        </ValidateFormItem>
        <ValidateFormItem name="password" label="Contraseña" span="4" mark v-slot="{ value, handleChange, error, id }"
                          v-if="!props.form?.id">
            <Password :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid toggleMask :feedback="false" :id="id"
                      maxlength="20" autocomplete="new-password"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button label="Cancelar" iconPos="right" variant="outlined" fluid outlined @click="props.closeModal()" :loading #icon>
            <i-material-symbols-cancel-outline-rounded/>
        </Button>
        <Button label="Enviar" iconPos="right" fluid @click="onCreate()" :loading #icon>
            <i-material-symbols-send-outline-rounded/>
        </Button>
    </div>
</template>
