<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { onMounted, ref } from "vue";
import { useForm } from "vee-validate";
import type { CommentInterface, CommentsGet } from "@/types/CommentsInterface.ts";
import * as yup from "yup";
import TestimonialsGrid from "@/components/TestimonialsGrid.vue";

interface CommentPayload {
	comment: string;
	full_name: string;
	rating: number;
}

const loading = ref(false);
const loadingList = ref(false);
const comments = ref<CommentInterface[]>([]);

const validationSchema = yup.object({
	comment: yup.string().trim().required("Ingrese su comentario").min(5, "Debe tener al menos 5 caracteres"),
	full_name: yup.string().trim().required("Ingrese su nombre").min(3, "Debe tener al menos 3 caracteres"),
	rating: yup.number().required("Seleccione una calificación").min(1, "Mínimo 1 estrella").max(5, "Máximo 5 estrellas")
});

const { handleSubmit, defineField, resetForm } = useForm<CommentPayload>({
	validationSchema,
	initialValues: {
		full_name: "",
		comment: "",
		rating: 5
	}
});

const [ fullName, fullNameProps ] = defineField("full_name");
const [ comment, commentProps ] = defineField("comment");
const [ rating, ratingProps ] = defineField("rating");

const onGetApprovedComments = async() => {
	try {
		loadingList.value = true;
		const { response }: CommentsGet = await Api.Get({ route: "comments" });
		if (response?.status === 200) {
			comments.value = Array.isArray(response.data.data) ? response.data.data : [];
		}
	} catch (e) {
		console.error(e);
	} finally {
		loadingList.value = false;
	}
};

const onSaveComment = handleSubmit(async(values) => {
	try {
		loading.value = true;
		const { response } = await Api.Post({ route: "comments", data: values });

		if (response && [ 200, 201 ].includes(response.status)) {
			useGlobalToast({
				severity: "success",
				summary: "Comentario enviado",
				message: "Gracias por tu comentario, se publicará tras ser aprobado."
			});
			resetForm({ values: { full_name: "", comment: "", rating: 5 } });
			await onGetApprovedComments();
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
}, ({ errors }) => castFormErrors(errors));

onMounted(async() => {
	await onGetApprovedComments();
});
</script>

<template>
	<section class="flex flex-col gap-8">
		<TestimonialsGrid :comments="comments" :loading="loadingList"/>

		<Card #content>
			<div class="flex flex-col gap-4">
				<h3 class="m-0 text-2xl font-bold">Comparte tu experiencia</h3>
				<p class="m-0 text-surface-500">Tu comentario nos ayuda a mejorar nuestro servicio.</p>

				<div class="align-items-form">
					<ValidateFormItem span="12" label="Nombre completo" name="full_name" mark v-slot="{ error }">
						<InputText v-model="fullName" v-bind="fullNameProps" :invalid="!!error" fluid placeholder="Ej: Juan Pérez"/>
					</ValidateFormItem>

					<ValidateFormItem span="12" label="Comentario" name="comment" mark v-slot="{ error }">
						<Textarea v-model="comment" v-bind="commentProps" :invalid="!!error" fluid rows="4"
						          placeholder="Escribe tu experiencia"/>
					</ValidateFormItem>

					<ValidateFormItem span="12" label="Calificación" name="rating" mark v-slot="{ error }">
						<div class="flex flex-col gap-2">
							<Rating v-model="rating" v-bind="ratingProps" :cancel="false"/>
							<small class="text-red-500" v-if="error">{{ error }}</small>
						</div>
					</ValidateFormItem>
				</div>

				<Button label="Enviar comentario" :loading="loading" @click="onSaveComment"/>
			</div>
		</Card>
	</section>
</template>

