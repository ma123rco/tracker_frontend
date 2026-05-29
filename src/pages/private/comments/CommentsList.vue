<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { formatDateToString } from "@/composables/convertDates.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { onMounted, ref } from "vue";
import type { CommentInterface, CommentsGet } from "@/types/CommentsInterface.ts";
import { useConfirm } from "primevue";

const commentsData = ref<CommentInterface[]>([]);
const loading = ref(false);
const confirm = useConfirm();

const filters = ref<{
	rating: number | null;
	approved: boolean | null;
	from: Date | null;
	to: Date | null;
}>({
	rating: null,
	approved: null,
	from: null,
	to: null
});

const ratingOptions = [
	{ label: "1 estrella", value: 1 },
	{ label: "2 estrellas", value: 2 },
	{ label: "3 estrellas", value: 3 },
	{ label: "4 estrellas", value: 4 },
	{ label: "5 estrellas", value: 5 }
];

const approvedOptions = [
	{ label: "Aprobado", value: true },
	{ label: "Pendiente", value: false }
];

const buildParams = () => {
	const params: Record<string, unknown> = {};

	if (filters.value.rating !== null) params.rating = filters.value.rating;
	if (filters.value.approved !== null) params.approved = filters.value.approved;
	if (filters.value.from) params.from = filters.value.from;
	if (filters.value.to) params.to = filters.value.to;

	return params;
};

const onGetComments = async() => {
	try {
		loading.value = true;
		const { response }: CommentsGet = await Api.Get({
			route: "comments/admin",
			params: buildParams()
		});

		if (response?.status === 200) {
			commentsData.value = Array.isArray(response.data.data) ? response.data.data : [];
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const onApproveComment = async(comment: CommentInterface, approved: boolean) => {
	try {
		loading.value = true;
		const { response } = await Api.Put({
			route: `comments/${ comment.id }/approved`,
			data: { approved }
		});

		if (response?.status === 200) {
			useGlobalToast({ summary: `Comentario ${ approved ? "aprobado" : "oculto" }`, severity: "success" });
			await onGetComments();
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const onConfirmApproveComment = (comment: CommentInterface, approved: boolean) => {
	confirm.require({
		header: "Confirmación",
		message: `¿Desea aprobar el comentario de ${ comment.full_name }?`,
		acceptLabel: `${ approved ? "Aprobar" : "Ocultar" }`,
		rejectLabel: "Cancelar",
		acceptClass: `${ approved ? "p-button-success" : "p-button-danger" }`,
		accept: async() => {
			await onApproveComment(comment, approved);
		}
	});
};

const onClearFilters = async() => {
	filters.value = {
		rating: null,
		approved: null,
		from: null,
		to: null
	};

	await onGetComments();
};

onMounted(async() => {
	await onGetComments();
});
</script>

<template>
	<div class="align-header">
		<p class="font-semibold text-xl mb-3">Comentarios</p>
	</div>

	<Card class="mb-3" #content>
		<div class="align-items-form">
			<ValidateFormItem span="3" label="Calificación" forLabel="comment-filter-rating" v-slot="{ id }">
				<Select v-model="filters.rating" fluid :options="ratingOptions" optionLabel="label" optionValue="value" showClear
				        placeholder="Todas" :labelId="id"/>
			</ValidateFormItem>

			<ValidateFormItem span="3" label="Estado" forLabel="comment-filter-approved" v-slot="{ id }">
				<Select v-model="filters.approved" fluid :options="approvedOptions" optionLabel="label" optionValue="value" showClear
				        placeholder="Todos" :labelId="id"/>
			</ValidateFormItem>

			<ValidateFormItem span="3" label="Desde" forLabel="comment-filter-from" v-slot="{ id }">
				<DatePicker v-model="filters.from" fluid show-icon :inputId="id"/>
			</ValidateFormItem>

			<ValidateFormItem span="3" label="Hasta" forLabel="comment-filter-to" v-slot="{ id }">
				<DatePicker v-model="filters.to" fluid show-icon :minDate="filters.from ?? undefined" :inputId="id"/>
			</ValidateFormItem>
		</div>

		<div class="mt-3 flex gap-2 justify-end">
			<Button label="Limpiar" severity="secondary" outlined @click="onClearFilters"/>
			<Button label="Filtrar" :loading="loading" @click="onGetComments"/>
		</div>
	</Card>

	<Card #content>
		<DataTable :value="commentsData" :loading="loading" showGridlines stripedRows tableStyle="min-width: 80rem">
			<template #loading>
				<LoadingPage/>
			</template>
			<template #empty>
				<EmptyTable/>
			</template>

			<Column header="Acciones" #body="{ data }" style="width: 10rem">
				<div class="flex gap-1.5 flex-wrap items-center">
					<Button v-if="!data.approved" size="small" label="Aprobar" severity="success" :loading="loading"
					        @click="onConfirmApproveComment(data, true)"/>
					<Button v-if="data.approved" severity="warn" :loading="loading" @click="onConfirmApproveComment(data, false)"
					        v-tooltip="'Ocultar comentario'" #icon>
						<i-material-symbols-hide-source-outline/>
					</Button>
				</div>
			</Column>
			<Column field="full_name" header="Nombre" style="width: 16rem"/>
			<Column field="comment" header="Comentario" style="width: 30rem" #body="{ data }">
				<span class="line-clamp-2">{{ data.comment }}</span>
			</Column>
			<Column field="rating" header="Calificación" style="width: 10rem" #body="{ data }">
				<Rating :modelValue="data.rating" :cancel="false" readonly/>
			</Column>
			<Column field="approved" header="Estado" style="width: 8rem" #body="{ data }">
				<Tag :value="data.approved ? 'Aprobado' : 'Pendiente'" :severity="data.approved ? 'success' : 'warning'"/>
			</Column>
			<Column field="created_at" header="Fecha" style="width: 20rem" #body="{ data }">
				{{ data.created_at ? formatDateToString(data.created_at, "dd-MM-yyyy hh:mm:ss aa") : "-" }}
			</Column>
		</DataTable>
	</Card>
</template>

