<script setup lang="ts">
import type { TaskAssignmentGet, TasksInterface } from "@/types/ProjectsInterface";
import TaskImageGallery from "@/pages/private/task/TaskImageGallery.vue";
import TaskLocationMap from "@/pages/private/task/TaskLocationMap.vue";
import useGlobalToast from "@/composables/toastEvent.ts";
import { parseDateLocal } from "@/composables/convertDates.ts";
import { Api } from "@/api/connection.ts";
import { computed, onMounted, ref } from "vue";

const props = defineProps<{ task: TasksInterface; closeModal?: () => void, reloadData: () => Promise<void> }>();

const currentTask = ref<TasksInterface | null>(null);
const queuedFiles = ref<File[]>([]);
const inputFileRef = ref<HTMLInputElement | null>(null);
const uploadingImages = ref(false);
const loadingTask = ref(false);
const deletingImages = ref(false);

const taskData = computed(() => currentTask.value ?? props.task);

const fetchTaskById = async() => {

	loadingTask.value = true;
	try {
		const { response }: TaskAssignmentGet = await Api.Get({
			params: { size: 5000, taskId: taskData.value.id },
			paramsSerializer: { indexes: null },
			route: `projects/${ props.task.project_id }/tasks`
		});
		if (response && response.status === 200) {
			const found = response.data.data[0];

			if (found.id === props.task.id) {
				currentTask.value = found;
			}
		}
	} catch (e) {
		useGlobalToast({ summary: "No se pudo actualizar el detalle de la tarea", severity: "error" });
	} finally {
		loadingTask.value = false;
	}
};

/* Transformar URLs de imágenes: concatenar con API URL si es relativa */
const imageBaseUrl = import.meta.env.VITE_API_URL;

const getImageUrl = (url: string | undefined): string => {
	if ( !url) return "";
	if (url.startsWith("http")) return url; // Ya es URL absoluta
	// Si es relativa, concatenar con API base URL
	return `${ imageBaseUrl }${ url.startsWith("/") ? url : "/" + url }`;
};

const fullPhoto1 = computed(() => getImageUrl(taskData.value.photo1 ?? undefined));
const fullPhoto2 = computed(() => getImageUrl(taskData.value.photo2 ?? undefined));

const imageCount = computed(() => {
	let count = 0;
	if (taskData.value.photo1) count += 1;
	if (taskData.value.photo2) count += 1;
	return count;
});

const statusLabel: Record<TasksInterface["status"], string> = {
	assigned: "Asignada",
	completed: "Completada",
	in_progress: "En progreso",
	pending: "Pendiente"
};

const statusSeverity: Record<TasksInterface["status"], "success" | "warn" | "info" | "secondary"> = {
	assigned: "info",
	completed: "success",
	in_progress: "warn",
	pending: "secondary"
};

const dueDateText = computed(() => {
	const d = parseDateLocal(taskData.value.due_date);
	if ( !d) return "Sin fecha";
	return d.toLocaleDateString("es-BO", {
		day: "2-digit",
		month: "long",
		year: "numeric"
	});
});

const users = computed(() => taskData.value.users ?? []);
const assignedCount = computed(() => users.value.length);
const canAttachImages = computed(() => imageCount.value + queuedFiles.value.length < 2);

const getUserPhotoUrl = (photo?: string | null): string => {
	if (typeof photo !== "string") return "";
	return photo.trim();
};

const getUserInitials = (names?: string, lastnames?: string): string => {
	return `${ names?.trim().charAt(0) ?? "" }${ lastnames?.trim().charAt(0) ?? "" }`.toUpperCase() || "--";
};

const openFilePicker = () => inputFileRef.value?.click();

const onSelectFiles = (event: Event) => {
	const input = event.target as HTMLInputElement;
	const files = input.files ? Array.from(input.files) : [];
	if (files.length === 0) return;

	const freeSlots = 2 - imageCount.value - queuedFiles.value.length;
	if (freeSlots <= 0) {
		useGlobalToast({ summary: "Esta tarea ya tiene 2 imágenes", severity: "warn" });
		input.value = "";
		return;
	}

	queuedFiles.value = [ ...queuedFiles.value, ...files.slice(0, freeSlots) ];
	if (files.length > freeSlots) {
		useGlobalToast({ summary: `Solo se agregaron ${ freeSlots } imagen(es)`, severity: "warn" });
	}

	input.value = "";
};

const removeQueuedFile = (index: number) => {
	queuedFiles.value.splice(index, 1);
};

const uploadImages = async() => {
	if (queuedFiles.value.length === 0) return;

	if ( !props.task.project_id || !props.task.id) {
		useGlobalToast({ summary: "No se pudo identificar la tarea", severity: "error" });
		return;
	}

	uploadingImages.value = true;
	try {
		// Sincroniza el detalle antes de asignar slots para evitar sobrescrituras.
		await fetchTaskById();

		const hasPhoto1 = !!taskData.value.photo1;
		const hasPhoto2 = !!taskData.value.photo2;
		const slotsLibre: Array<"photo1" | "photo2"> = [];

		if ( !hasPhoto1) slotsLibre.push("photo1");
		if ( !hasPhoto2) slotsLibre.push("photo2");

		if (slotsLibre.length === 0) {
			useGlobalToast({ summary: "Esta tarea ya tiene 2 imágenes", severity: "warn" });
			queuedFiles.value = [];
			return;
		}

		const filesToUpload = queuedFiles.value.slice(0, slotsLibre.length);
		const formData = new FormData();

		filesToUpload.forEach((file, index) => {
			formData.append(slotsLibre[index], file);
		});

		await Api.Post({
			data: formData,
			route: `projects/${ props.task.project_id }/tasks/${ props.task.id }/photos`
		});

		queuedFiles.value = [];
		await props.reloadData();
		await fetchTaskById();
		useGlobalToast({ summary: "Imágenes subidas exitosamente", severity: "success" });
	} catch (e) {
		useGlobalToast({ summary: "Error al subir imágenes", severity: "error" });
		console.error(e);
	} finally {
		uploadingImages.value = false;
	}
};

const onImageRemoved = async() => {
	if ( !props.task.project_id || !props.task.id) {
		useGlobalToast({ summary: "No se pudo identificar la tarea", severity: "error" });
		return;
	}

	if ( !taskData.value.photo1 && !taskData.value.photo2) return;

	deletingImages.value = true;
	try {
		await Api.Destroy({
			route: `projects/${ props.task.project_id }/tasks/${ props.task.id }/photos`
		});
		await props.reloadData();
		await fetchTaskById();
		useGlobalToast({ summary: "Imágenes eliminadas, tendrá que volver a subirlas nuevamente", severity: "success", life: 10000 });
	} catch (e) {
		useGlobalToast({ summary: "Error al eliminar imagen", severity: "error" });
		console.error(e);
	} finally {
		deletingImages.value = false;
	}
};

onMounted(() => {
	void fetchTaskById();
});

</script>

<template>
	<div class="task-detail-wrapper">
		<section class="hero-card">
			<p class="hero-meta">Proyecto #{{ taskData.project_id }}</p>
			<div class="task-title-row">
				<h3 class="task-title">{{ taskData.title }}</h3>
				<Tag :value="statusLabel[taskData.status]" :severity="statusSeverity[taskData.status]"/>
			</div>
			<p class="task-description">
				{{ taskData.description || "Sin descripción" }}
			</p>
		</section>

		<section class="quick-grid">
			<article class="quick-item">
				<p class="quick-label">Vencimiento</p>
				<p class="quick-value">{{ dueDateText }}</p>
			</article>
			<article class="quick-item">
				<p class="quick-label">Asignados</p>
				<p class="quick-value">{{ assignedCount }} personas</p>
			</article>
			<article class="quick-item">
				<p class="quick-label">Imágenes</p>
				<p class="quick-value">{{ imageCount }}/2</p>
			</article>
		</section>

		<section class="content-card">
			<h4 class="section-titles">Equipo asignado</h4>
			<div v-if="users.length" class="user-list-grid">
				<article v-for="user in users" :key="user.id" class="user-list-item">
					<img v-if="getUserPhotoUrl(user.photo)" :src="getUserPhotoUrl(user.photo)" :alt="`${user.names} ${user.lastnames}`"
					     class="user-avatar-image">
					<div v-else class="user-avatar-fallback">
						{{ getUserInitials(user.names, user.lastnames) }}
					</div>
					<div class="min-w-0">
						<p class="user-full-name">{{ user.names }} {{ user.lastnames }}</p>
						<p class="user-role-text">{{ user.role }}</p>
					</div>
				</article>
			</div>
			<p v-else class="empty-text">Sin usuarios asignados</p>
		</section>

		<section v-if="taskData.location" class="content-card">
			<h4 class="section-titles">Ubicación</h4>
			<TaskLocationMap :location="taskData.location" :title="taskData.title"/>
		</section>

		<section class="content-card pb-3">
			<div class="flex gap-2 items-center justify-between mb-3">
				<div>
					<h4 class="section-titles">Imágenes de tarea</h4>
					<p class="section-helper">Máximo 2 imágenes por tarea</p>
				</div>
				<Button severity="danger" outlined size="small" label="Eliminar imagenes" :loading="deletingImages"
				        :disabled="deletingImages"
				        @click="onImageRemoved"/>
			</div>
			<TaskImageGallery :photo1="fullPhoto1" :photo2="fullPhoto2"/>

			<Divider class="my-3!"/>

			<input ref="inputFileRef" type="file" multiple accept="image/*" class="hidden" @change="onSelectFiles">

			<div class="actions-grid">
				<Button label="Seleccionar" severity="secondary" outlined :disabled="!canAttachImages || uploadingImages"
				        @click="openFilePicker" #icon>
					<i-material-symbols-add-photo-alternate-rounded/>
				</Button>
				<Button label="Subir" :disabled="queuedFiles.length === 0 || uploadingImages" :loading="uploadingImages"
				        @click="uploadImages" #icon>
					<i-material-symbols-upload-2-rounded/>
				</Button>
			</div>

			<div v-if="queuedFiles.length" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
				<div v-for="(file, index) in queuedFiles" :key="file.name + index" class="queued-item">
					<p class="truncate">{{ file.name }}</p>
					<Button text severity="danger" size="small" label="Quitar" @click="removeQueuedFile(index)"/>
				</div>
			</div>
		</section>

		<section class="sticky-footer" v-if="props.closeModal">
			<Button label="Cerrar" severity="contrast" fluid @click="props.closeModal()"/>
		</section>
	</div>
</template>

<style scoped>
@reference "@/style.css";

.task-detail-wrapper {
	@apply space-y-3 max-h-[72vh] overflow-y-auto pb-16;
}

.hero-card {
	@apply rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 p-3;
}

.hero-meta {
	@apply text-xs text-surface-500 mb-1;
}

.task-title-row {
	@apply flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between;
}

.task-title {
	@apply text-lg sm:text-xl font-semibold leading-tight;
}

.task-description {
	@apply mt-3 text-sm text-surface-600 dark:text-surface-300 whitespace-pre-wrap;
}

.quick-grid {
	@apply grid grid-cols-2 gap-2;
}

.quick-item {
	@apply rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-2.5;
}

.quick-label {
	@apply text-[11px] text-surface-500;
}

.quick-value {
	@apply text-sm font-semibold mt-0.5;
}

.content-card {
	@apply rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-900 p-3 space-y-2;
}

.section-titles {
	@apply text-base font-semibold;
}

.section-helper {
	@apply text-xs text-surface-500 mt-0.5 mb-2;
}

.empty-text {
	@apply text-sm text-surface-500;
}

.actions-grid {
	@apply grid grid-cols-2 gap-2;
}

.queued-item {
	@apply rounded-md border border-surface-300 dark:border-surface-700 p-2 text-xs flex items-center justify-between gap-2;
}

.user-list-grid {
	@apply grid grid-cols-1 sm:grid-cols-2 gap-2;
}

.user-list-item {
	@apply flex items-center gap-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 px-3 py-2.5;
}

.user-avatar-image {
	@apply h-10 w-10 rounded-full object-cover border border-surface-200 dark:border-surface-700 shrink-0;
}

.user-avatar-fallback {
	@apply h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary/15 text-primary border border-primary/20;
}

.user-full-name {
	@apply text-sm font-semibold leading-tight truncate;
}

.user-role-text {
	@apply text-xs text-surface-500 mt-0.5;
}

.sticky-footer {
	@apply sticky bottom-0 left-0 right-0 bg-white/90 dark:bg-surface-900/90 backdrop-blur-sm py-2;
}

@media (min-width: 768px) {
	.task-detail-wrapper {
		@apply pb-3;
	}

	.quick-grid {
		@apply grid-cols-3;
	}

	.sticky-footer {
		@apply static bg-transparent py-0;
	}
}
</style>
