<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import draggable from "vuedraggable";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import useGlobalToast from "@/composables/toastEvent.ts";
import { parseDateLocal } from "@/composables/convertDates.ts";
import { userDataConfig } from "@/store/layout/storeUserData.ts";
import SkeletonColumns from "./SkeletonColumns.vue";
import CardTask from "@/pages/private/task/CardTask.vue";
import type { ResponseUserInterface, UserInterface } from "@/types/UsersInterface.ts";
import type {
	TaskAssignmentGet,
	TaskColumnsInterface,
	TasksInterface,
	TasksStatus
} from "@/types/ProjectsInterface.ts";

const slider = ref<HTMLElement | null>(null);
const loadingColumns = ref(true);
const loadingCards = ref(true);
const filtersCollapsed = ref(false);
const isDown = ref(false);
let startX = 0;
let scrollLeft = 0;

const userStore = userDataConfig();
const userOptions = ref<UserInterface[]>([]);

const filters = ref<{
	dateFrom: Date | null;
	dateTo: Date | null;
	employee: number | null;
	name: string;
	period: string;
	status: TasksStatus[];
}>({
	dateFrom: null,
	dateTo: null,
	employee: null,
	name: "",
	period: "monthly",
	status: [ "pending", "assigned", "in_progress" ]
});

const currentUser = computed(() => userStore.userData?.user);
const currentUserRole = computed(() => String(currentUser.value?.role ?? "").toLowerCase());
const isTecnico = computed(() => currentUserRole.value === "tecnico");
const canSelectAssignedUser = computed(() => !isTecnico.value);

const statusOptions: Array<{ label: string; value: TasksStatus }> = [
	{ label: "Pendiente", value: "pending" },
	{ label: "Asignada", value: "assigned" },
	{ label: "En progreso", value: "in_progress" },
	{ label: "Completada", value: "completed" }
];

const optionsFilterDate = ref<Record<string, string>[]>([
	{ label: "Hoy", value: "today" },
	{ label: "Semanal", value: "weekly" },
	{ label: "Quincenal", value: "biweekly" },
	{ label: "Mensual", value: "monthly" }
]);

const userSelectOptions = computed(() => userOptions.value.map(user => ({
	label: `${ user.names } ${ user.lastnames }`,
	value: user.id
})));

const hasActiveFilters = computed(() => Boolean(
	(canSelectAssignedUser.value && filters.value.employee) ||
	filters.value.status.length ||
	filters.value.dateFrom ||
	filters.value.dateTo ||
	filters.value.name.trim()
));

const COLUMN_DEFINITION: ReadonlyArray<{ id: TasksStatus; title: string; description?: string; }> = [
	{ id: "pending", title: "Pendientes" },
	{ id: "assigned", title: "Asignadas" },
	{ id: "in_progress", title: "En progreso" },
	{ id: "completed", title: "Completadas" }
];

const columns = ref<TaskColumnsInterface[]>(COLUMN_DEFINITION.map(col => ({
	...col,
	description: col.description ?? "",
	cards: []
})));

const onPointerDown = (e: PointerEvent) => {
	const target = e.target as HTMLElement;

	// Si viene de una card, no hacemos drag-scroll
	if (target.closest(".slot-trello-card")) return;

	if ( !slider.value) return;

	isDown.value = true;
	slider.value.setPointerCapture(e.pointerId);

	startX = e.clientX;
	scrollLeft = slider.value.scrollLeft;
};

const onPointerMove = (e: PointerEvent) => {
	if ( !isDown.value || !slider.value) return;

	const walk = e.clientX - startX;
	slider.value.scrollLeft = scrollLeft - walk;
};

const onPointerUp = (e: PointerEvent) => {
	isDown.value = false;
	slider.value?.releasePointerCapture(e.pointerId);
};

const isValidStatus = (s: unknown): s is TasksStatus => [ "pending", "assigned", "in_progress", "completed" ].includes(String(s));

const applyLocalFilters = (items: TasksInterface[]) => {
	let filtered = [ ...items ];

	if (filters.value.employee) {
		filtered = filtered.filter(task => task.users?.some(user => user.id === filters.value.employee));
	}

	if (filters.value.status.length > 0) {
		filtered = filtered.filter(task => filters.value.status.includes(task.status));
	}

	const taskNameQuery = filters.value.name.trim().toLowerCase();
	if (taskNameQuery) {
		filtered = filtered.filter(task => task.title.toLowerCase().includes(taskNameQuery));
	}

	let rangeStart: Date | null = null;
	let rangeEnd: Date | null = null;

	if (filters.value.dateFrom) {
		rangeStart = new Date(filters.value.dateFrom);
		rangeStart.setHours(0, 0, 0, 0);
	}
	if (filters.value.dateTo) {
		rangeEnd = new Date(filters.value.dateTo);
		rangeEnd.setHours(23, 59, 59, 999);
	}

	if (rangeStart || rangeEnd) {
		filtered = filtered.filter(task => {
			const due = parseDateLocal(task.due_date);
			if ( !due) return false;
			if (rangeStart && due < rangeStart) return false;
			return !(rangeEnd && due > rangeEnd);

		});
	}

	return filtered;
};

const onGetUsers = async() => {
	const current = currentUser.value;
	if ( !current?.id) return;

	if (canSelectAssignedUser.value) {
		try {
			const { response }: ResponseUserInterface = await Api.Get({ route: "users" });
			if (response?.status === 200) {
				userOptions.value = response.data.data.filter(user => user.role !== "Admin");
			}
		} catch (e) {
			userOptions.value = [ current ];
			useGlobalToast({ summary: "No se pudo cargar la lista de usuarios", severity: "warn" });
		}
		return;
	}

	// Tecnico: solo puede consultar sus propias tareas.
	filters.value.employee = current.id;
	userOptions.value = [ current ];
};

const onGetTaskAssignment = useDebounceFn(async() => {
	loadingCards.value = true;

	try {
		const { response }: TaskAssignmentGet = await Api.Get({
			route: "projects/tasks",
			params: { ...filters.value },
			paramsSerializer: { indexes: null }
		});

		columns.value.forEach(col => (col.cards = []));

		const taskList = Array.isArray(response?.data?.data) ? response.data.data : [];
		const filteredTasks = applyLocalFilters(taskList);

		if (response?.status === 200 && filteredTasks.length > 0) {
			for (const task of filteredTasks) {
				const colId: TasksStatus = isValidStatus(task.status) ? task.status : "pending";

				const column = columns.value.find(c => c.id === colId);
				column?.cards.push(task);
			}
		}
	} finally {
		loadingCards.value = false;
		loadingColumns.value = false;
	}
}, 500);

const onChangeDate = async() => {
	if (filters.value.dateFrom && filters.value.dateTo && filters.value.dateFrom > filters.value.dateTo) {
		filters.value.dateTo = filters.value.dateFrom;
	}
	await onGetTaskAssignment();
};

const onChangeStatuses = async() => {
	await onGetTaskAssignment();
};

const onChangeAssignedUser = async() => {
	await onGetTaskAssignment();
};

const onNameFilterInput = useDebounceFn(async() => {
	await onGetTaskAssignment();
}, 400);

const onClearFilters = async() => {
	filters.value = {
		dateFrom: null,
		dateTo: null,
		name: "",
		period: "",
		status: [],
		employee: canSelectAssignedUser.value ? null : currentUser.value?.id ?? null
	};
	await onGetTaskAssignment();
};

const onToggleFilters = () => {
	filtersCollapsed.value = !filtersCollapsed.value;
};

const onResizeWindow = () => {
	if (typeof window === "undefined") return;
	const isCompactViewport = window.innerWidth < 1024;
	if (isCompactViewport && !hasActiveFilters.value) {
		filtersCollapsed.value = true;
		return;
	}
	if ( !isCompactViewport) {
		filtersCollapsed.value = false;
	}
};

const onCardMoved = async(evt: any, fromCol: TaskColumnsInterface) => {
	const card = evt.item.__draggable_context?.element as TasksInterface;
	if ( !card) return;

	const toStatus = evt.to?.dataset?.status as TasksStatus;
	if ( !toStatus) {
		useGlobalToast({ message: "Movimiento no reconocido" });
		return;
	}

	if (fromCol.id !== toStatus) {
		try {
			await Api.Put({
				data: {
					description: card.description,
					due_date: card.due_date ? String(card.due_date).slice(0, 10) : null,
					location: card.location ?? null,
					project_id: card.project_id,
					status: toStatus,
					title: card.title,
					userIds: card.users?.map(u => u.id) ?? card.userIds ?? []
				},
				route: `projects/${ card.project_id }/tasks/${ card.id }`
			});
			await onGetTaskAssignment();
			useGlobalToast({ summary: "Estado actualizado" });
		} catch (e) {
			useGlobalToast({ summary: "Error al actualizar", severity: "error" });
		}
	}
};

onMounted(async() => {
	await onGetUsers();
	await onGetTaskAssignment();
	onResizeWindow();
	window.addEventListener("resize", onResizeWindow);
	if ( !slider.value) return;

	slider.value.addEventListener("pointerdown", onPointerDown);
	slider.value.addEventListener("pointermove", onPointerMove);
	slider.value.addEventListener("pointerup", onPointerUp);
	slider.value.addEventListener("pointercancel", onPointerUp);
});

onUnmounted(() => {
	window.removeEventListener("resize", onResizeWindow);
	if ( !slider.value) return;
	slider.value.removeEventListener("pointerdown", onPointerDown);
	slider.value.removeEventListener("pointermove", onPointerMove);
	slider.value.removeEventListener("pointerup", onPointerUp);
	slider.value.removeEventListener("pointercancel", onPointerUp);
});

</script>

<template>
	<div class="flex gap-2 h-full min-h-0 flex-col">
		<div class="task-header-block">
			<div class="task-header-row">
				<div class="task-header-title-wrap">
					<i-material-symbols-tune-rounded class="text-xl text-primary"/>
					<p class="font-semibold text-xl">Tareas asignadas</p>
				</div>
				<div class="task-header-actions">
					<Tag :value="hasActiveFilters ? 'Filtros activos' : 'Sin filtros'" :severity="hasActiveFilters ? 'info' : 'secondary'"
					     rounded/>
					<Button :label="filtersCollapsed ? 'Mostrar filtros' : 'Ocultar filtros'" text severity="secondary" size="small"
					        @click="onToggleFilters" #icon>
						<i-material-symbols-fitbit-arrow-downward-rounded v-if="filtersCollapsed"/>
						<i-material-symbols-arrow-upward-alt-rounded v-else/>
					</Button>
				</div>
			</div>

			<div class="filters-panel" v-show="!filtersCollapsed">
				<div class="filters-grid-task">
					<ValidateFormItem name="taskNameFilter" colsPro="filter-field-task filter-field--full" label="Nombre de tarea"
					                  labelClass="filter-label" hideError #default="{ id }">
						<InputText v-model="filters.name" :id="id" placeholder="Buscar por título" fluid
						           @update:model-value="onNameFilterInput"/>
					</ValidateFormItem>

					<ValidateFormItem name="taskAssignedUserFilter" colsPro="filter-field-task" label="Usuario asignado"
					                  labelClass="filter-label" hideError #default="{ id }">
						<Select v-model="filters.employee" :inputId="id" :options="userSelectOptions" optionLabel="label"
						        optionValue="value" fluid :showClear="canSelectAssignedUser"
						        :disabled="!canSelectAssignedUser || loadingCards" placeholder="Todos" @change="onChangeAssignedUser"/>
					</ValidateFormItem>


					<ValidateFormItem name="taskStatusFilter" colsPro="filter-field-task" label="Estados" labelClass="filter-label"
					                  hideError #default="{ id }">
						<MultiSelect v-model="filters.status" :inputId="id" :options="statusOptions" optionLabel="label"
						             optionValue="value" fluid placeholder="Todos" display="chip" :maxSelectedLabels="2"
						             selectedItemsLabel="{a} estados seleccionados" @change="onChangeStatuses"/>
					</ValidateFormItem>
					<ValidateFormItem name="taskPeriodTime" colsPro="filter-field-task" label="Periodo de tiempo"
					                  labelClass="filter-label" hideError #default="{ id }">
						<Select v-model="filters.period" :inputId="id" :options="optionsFilterDate" optionLabel="label"
						        optionValue="value" fluid showClear placeholder="Todos" @change="onGetTaskAssignment"/>
					</ValidateFormItem>
					<ValidateFormItem name="taskDateFromFilter" colsPro="filter-field-task" label="Desde" labelClass="filter-label"
					                  hideError #default="{ id }">
						<DatePicker v-model="filters.dateFrom" :inputId="id" fluid date-format="dd/mm/yy" show-button-bar
						            placeholder="dd/mm/aaaa" @update:model-value="onChangeDate"/>
					</ValidateFormItem>

					<ValidateFormItem name="taskDateToFilter" colsPro="filter-field-task" label="Hasta" labelClass="filter-label"
					                  hideError #default="{ id }">
						<DatePicker v-model="filters.dateTo" :inputId="id" fluid :min-date="filters.dateFrom ?? undefined"
						            date-format="dd/mm/yy" show-button-bar placeholder="dd/mm/aaaa" @update:model-value="onChangeDate"/>
					</ValidateFormItem>
				</div>
				<div class="filters-actions">
					<Button label="Limpiar filtros" severity="secondary" outlined :disabled="!hasActiveFilters || loadingCards"
					        @click="onClearFilters"/>
					<Button label="Actualizar" severity="contrast" :loading="loadingCards" @click="onGetTaskAssignment"/>
				</div>
			</div>
		</div>
		<div class="trello-column" ref="slider">
			<template v-if="loadingColumns">
				<SkeletonColumns v-for="i in 4" :key="i" class="section-trello-column"/>
			</template>
			<section tabindex="0" :aria-label="`Column ${col.id}`" role="region" class="section-trello-column" v-for="col in columns"
			         v-else>
				<header class="header-trello-column drag-column-handle">
					<div>
						<h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize"> {{ col.title }} </h4>
						<p v-if="col.description" class="text-xs text-slate-500 dark:text-slate-400">
							{{ col.description }}
						</p>
					</div>
				</header>
				<draggable v-model="col.cards" group="cards" item-key="id" animation="150" ghost-class="opacity-50" tag="section"
				           :data-status="col.id" handle=".drag-card-handle" @end="onCardMoved($event, col)" class="slot-trello-card">

					<template #item="{ element: card }: { element: TasksInterface }">
						<div class="h-24 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" v-if="loadingCards"/>
						<div class="relative drag-card-handle task-card-shell" v-else>
							<CardTask :task="card" :getNewData="onGetTaskAssignment"/>
						</div>
					</template>

					<template #footer>
						<p v-if="col.cards.length === 0" class="text-center text-primary"> No hay tarjetas </p>
					</template>
				</draggable>
			</section>
		</div>
	</div>
</template>

<style>
@reference "@/style.css";

.task-header-block {
	@apply mb-2 flex flex-col gap-2 sticky top-0 z-20 rounded-xl bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-sm;
}

.task-header-row {
	@apply flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3;
}

.task-header-actions {
	@apply flex items-center gap-2;
}

.task-header-title-wrap {
	@apply flex items-center gap-2;
}

.filters-panel {
	@apply w-full rounded-2xl p-3 sm:p-4 ;
}

.filters-grid-task {
	@apply grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4;
}


.filters-actions {
	@apply mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:justify-end;
}

.trello-column {
	@apply flex h-full min-h-0 gap-2 overflow-x-auto overflow-y-hidden active:cursor-grabbing select-none touch-pan-y pb-2;
}

.section-trello-column {
	@apply flex flex-col h-full min-h-0
	w-80 min-w-75 max-w-95 snap-start;
}

.header-trello-column {
	@apply flex shrink-0 items-center justify-between gap-2 rounded-t-xl p-3 bg-white dark:bg-surface-800
}


.slot-trello-card {
	@apply overflow-y-auto p-2.5 space-y-2.5 min-h-12.5 bg-white dark:bg-surface-800 rounded-b-xl
	border-t border-t-slate-300 dark:border-t-slate-600 mb-6
}

.task-card-shell {
	@apply min-h-28;
}

</style>