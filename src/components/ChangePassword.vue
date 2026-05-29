<script setup lang="ts">

import { Api } from "@/api/connection";
import { ref } from "vue";
import { useToast } from "primevue";
import { castFormErrors } from "../composables/castFormErrors";
import { useForm } from "vee-validate";
import * as yup from "yup";

const props = defineProps<{ userID: number | undefined; closeForm: () => void; }>();
const fields = ref({ newPassword: "", confirmPassword: "" });
const loading = ref(false);
const toast = useToast();

const schemaValidate = ref(yup.object({
	confirmPassword: yup.string().trim().when("$isNew", {
		is: () => props.userID,
		otherwise: (schema) => schema.notRequired(),
		then: (schema) => schema.required("Ingrese la confirmación").oneOf([ yup.ref("newPassword") ], "La contraseña no coincide").min(5, "Ingresa al menos 5 caracteres")
	}).label("Confirm. Contraseña"),
	newPassword: yup.string().trim().when("$isNew", {
		is: () => props.userID,
		otherwise: (schema) => schema.notRequired(),
		then: (schema) => schema.required("Ingrese su contraseña").min(5, "Ingresa al menos 5 caracteres")
	}).label("Contraseña")
}));

const { handleSubmit } = useForm({ validationSchema: schemaValidate, initialValues: fields.value });

const saveChangePassword = handleSubmit(async(values) => {
	try {

		loading.value = true;
		const { response } = await Api.Put({
			route: `users/${ props.userID }/password`, data: { confirmPassword: values.confirmPassword, newPassword: values.newPassword }
		});
		if (response && response.status === 200) {
			toast.add({ severity: "success", life: 5000, summary: "Contraseña actualizada correctamente" });
			props.closeForm();
			loading.value = false;
		}
		
	}catch (e) {
		loading.value = false;
		console.error(e);
	}
}, ({ errors }) => castFormErrors(errors));

</script>

<template>
	<div class="align-items-form">
		<ValidateFormItem mark span="6" label="Nueva Contraseña" name="newPassword" v-slot="{ value, error, handleChange }">
			<Password :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" input-id="newPassword" class="w-full"
			          :toggleMask="true" :feedback="false" autocomplete="off"/>
		</ValidateFormItem>
		<ValidateFormItem mark span="6" label="Confirmar Contraseña" name="confirmPassword"
		                  v-slot="{ value, error, handleChange }">
			<Password :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" input-id="newPassword" class="w-full"
			          :toggleMask="true" :feedback="false" autocomplete="off"/>
		</ValidateFormItem>
	</div>
	<div class="align-buttons-submit">
		<Button severity="secondary" raised fluid label="Cancelar" @click="props.closeForm()" :loading/>
		<Button raised fluid label="Confirmar" @click="saveChangePassword" :loading/>
	</div>
</template>
