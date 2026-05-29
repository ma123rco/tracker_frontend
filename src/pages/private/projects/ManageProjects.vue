<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { useForm } from "vee-validate";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import type { ProjectsInterface, StatusProject } from "@/types/ProjectsInterface.ts";
import * as yup from "yup";
import { onMounted, ref } from "vue";
import useGlobalToast from "@/composables/toastEvent.ts";

const props = defineProps<{ closeModal: () => void, reloadData: () => Promise<void>, form?: ProjectsInterface }>();

const optionsStatusProject = ref<{ label: string, value: StatusProject }[]>([
    { label: "En proceso", value: "doing" },
    { label: "Finalizado", value: "closed" },
    { label: "Pendiente", value: "pending" }
]);

const validationSchema = yup.object({
    description: yup.string().required("Añada una descripción"),
    end_date: yup.string().required("Ingrese fecha fin"),
    name: yup.string().required("Ingrese un nombre"),
    start_date: yup.string().required("Ingrese fecha inicio"),
    status: yup.string().required("Seleccione un estado")
});

const { handleSubmit, setValues } = useForm<ProjectsInterface>({ validationSchema });

const onCreate = handleSubmit(async(values) => {
    const isEdit = values?.id;
    const route = isEdit ? `projects/${ values.id }` : "projects";
    const method = isEdit ? Api.Put : Api.Post;
    const { response } = await method({ route, data: { ...values } });
    if (response && [ 200, 201 ].includes(response.status)) {
        useGlobalToast({ message: isEdit ? "Proyecto actualizado" : "Proyecto creado", severity: "success" });
        props.closeModal();
        await props.reloadData();
    }
}, ({ errors }) => castFormErrors(errors));

onMounted(() => {
    if (props.form?.id) setValues(props.form);
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem name="name" label="Nombre" span="12" mark v-slot="{ value, handleChange, error, id }">
            <InputText :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id"/>
        </ValidateFormItem>
        <ValidateFormItem name="status" label="Estado" span="4" mark v-slot="{ value, handleChange, error, id }">
            <Select :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :labelId="id"
                    :options="optionsStatusProject" optionLabel="label" optionValue="value"/>
        </ValidateFormItem>
        <ValidateFormItem name="start_date" label="F. Inicio" span="4" mark v-slot="{ value, handleChange, error, id }">
            <DatePicker :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id"/>
        </ValidateFormItem>
        <ValidateFormItem name="end_date" label="F. Fin" span="4" mark v-slot="{ value, handleChange, error, id }">
            <DatePicker :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id"/>
        </ValidateFormItem>
        <ValidateFormItem name="description" label="Descripción" span="12" mark v-slot="{ value, handleChange, error, id }">
            <Textarea :model-value="value" @update:modelValue="handleChange" :invalid="!!error" fluid :id="id"/>
        </ValidateFormItem>
    </div>
    <div class="align-buttons-submit">
        <Button label="Cancelar" iconPos="right" variant="outlined" fluid outlined @click="props.closeModal()" #icon>
            <i-material-symbols-cancel-outline-rounded/>
        </Button>
        <Button label="Enviar" iconPos="right" fluid @click="onCreate()" #icon>
            <i-material-symbols-send-outline-rounded/>
        </Button>
    </div>
</template>
