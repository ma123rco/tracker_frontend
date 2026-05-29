<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import { computed, onMounted, ref, type Component } from "vue";
import type {
	ResponseProjectsInterface,
	StatusProject,
	TaskReportAssignmentGet,
	TasksStatus
} from "@/types/ProjectsInterface.ts";
import type { AttendanceInterfaceGet } from "@/types/AttendanceInterface.ts";
import type { ResponseUserInterface, UserInterface } from "@/types/UsersInterface.ts";

type ReportType = "projects" | "tasks" | "attendance";
type TaskSortBy = "dueDate" | "completedAt" | "status" | "title";

const loading = ref(false);
const selectedReport = ref<ReportType>("projects");
const usersOptions = ref<UserInterface[]>([]);
const projectsOptions = ref<{ id: number; name: string }[]>([]);

const taskFilters = ref<{
	projects: number[];
	users: number[];
	status: TasksStatus[];
	dueDateFrom: Date | null;
	dueDateTo: Date | null;
	completedAtFrom: Date | null;
	completedAtTo: Date | null;
	sortBy: TaskSortBy | null;
}>({
	projects: [],
	users: [],
	status: [],
	dueDateFrom: null,
	dueDateTo: null,
	completedAtFrom: null,
	completedAtTo: null,
	sortBy: null
});

const projectFilters = ref<{
	status: StatusProject[];
	startDateFrom: Date | null;
	startDateTo: Date | null;
	endDateFrom: Date | null;
	endDateTo: Date | null;
}>({
	status: [],
	startDateFrom: null,
	startDateTo: null,
	endDateFrom: null,
	endDateTo: null
});

const attendanceFilters = ref({ from: null as Date | null, to: null as Date | null, userId: null as number | null });

const optionsToPrint: { key: ReportType; label: string; description: string; icon: Component }[] = [
	{
		key: "projects",
		label: "Proyectos",
		description: "Descarga proyectos en PDF con filtros por estado y rango de fechas.",
		icon: IconMaterialSymbolsPivotTableChartRounded as Component
	},
	{
		key: "tasks",
		label: "Tareas",
		description: "Descarga tareas en PDF con filtros por proyectos, usuarios, estado y fechas.",
		icon: IconMaterialSymbolsPieChart as Component
	},
	{
		key: "attendance",
		label: "Asistencias",
		description: "Descarga asistencias en PDF por fechas y trabajador, sin abrir modal.",
		icon: IconMaterialSymbolsCalendarMonth as Component
	}
];

const optionsTaskStatus: { label: string; value: TasksStatus }[] = [
	{ label: "Asignada", value: "assigned" },
	{ label: "Pendiente", value: "pending" },
	{ label: "En progreso", value: "in_progress" },
	{ label: "Completada", value: "completed" }
];

const optionsProjectStatus: { label: string; value: StatusProject }[] = [
	{ label: "Pendiente", value: "pending" },
	{ label: "En progreso", value: "in_progress" },
	{ label: "Abierto", value: "open" },
	{ label: "Cerrado", value: "closed" },
	{ label: "En ejecución", value: "doing" }
];

const optionsTaskSortBy: { label: string; value: TaskSortBy }[] = [
	{ label: "Fecha límite", value: "dueDate" },
	{ label: "Fecha de completado", value: "completedAt" },
	{ label: "Estado", value: "status" },
	{ label: "Título", value: "title" }
];

const currentReportDescription = computed(
	() => optionsToPrint.find(item => item.key === selectedReport.value)?.description ?? ""
);

const toCsv = (value: Array<string | number>) => (value.length ? value.join(",") : undefined);

const cleanParams = (params: Record<string, unknown>) => {
	return Object.fromEntries(Object.entries(params).filter(([ , value ]) => {
		if (value === null || value === undefined || value === "") return false;
		return !(Array.isArray(value) && value.length === 0);
	}));
};

const onGetAllUsers = async() => {
	const { response }: ResponseUserInterface = await Api.Get({ route: "users" });
	if (response && response.status === 200) {
		usersOptions.value = response.data.data.filter((dt: UserInterface) => dt.role !== "Admin");
	}
};

const onGetAllProjects = async() => {
	const { response }: ResponseProjectsInterface = await Api.Get({ route: "projects" });
	if (response && response.status === 200) {
		projectsOptions.value = response.data.data.map(project => ({
			id: project.id ?? 0, name: project.name
		})).filter(project => project.id > 0);
	}
};

const onGetDataProjects = async() => {
	useGlobalToast({ severity: "info", summary: "Generando PDF de proyectos..." });
	const params = cleanParams({
		status: toCsv(projectFilters.value.status),
		startDateFrom: projectFilters.value.startDateFrom,
		startDateTo: projectFilters.value.startDateTo,
		endDateFrom: projectFilters.value.endDateFrom,
		endDateTo: projectFilters.value.endDateTo
	});

	const { response }: ResponseProjectsInterface = await Api.Get({ route: "reports/projects", params });
	if (response && response.status === 200) {
		const { exportProjectsToPdf } = await import("@/prints/ProjectsExcel.ts");
		await exportProjectsToPdf(response.data.data);
	}
};

const onGetDataTask = async() => {
	useGlobalToast({ severity: "info", summary: "Generando PDF de tareas..." });
	const params = cleanParams({
		projects: toCsv(taskFilters.value.projects),
		users: toCsv(taskFilters.value.users),
		status: toCsv(taskFilters.value.status),
		dueDateFrom: taskFilters.value.dueDateFrom,
		dueDateTo: taskFilters.value.dueDateTo,
		completedAtFrom: taskFilters.value.completedAtFrom,
		completedAtTo: taskFilters.value.completedAtTo,
		sortBy: taskFilters.value.sortBy
	});

	const { response }: TaskReportAssignmentGet = await Api.Get({ route: "reports/tasks", params });
	if (response && response.status === 200) {
		const { exportTasksToPdf } = await import("@/prints/TaskExcel.ts");
		await exportTasksToPdf(response.data.data);
	}
};

const onGetDataAttendance = async() => {
	useGlobalToast({ severity: "info", summary: "Generando PDF de asistencias..." });
	const params = cleanParams({ ...attendanceFilters.value });
	const { response }: AttendanceInterfaceGet = await Api.Get({ route: "reports/attendance", params });
	if (response && response.status === 200) {
		const { exportAttendanceToPdf } = await import("@/prints/PrintsAttendance.ts");
		await exportAttendanceToPdf(response.data.data);
	}
};

const onGenerateReport = async() => {
	try {
		loading.value = true;
		if (selectedReport.value === "projects") await onGetDataProjects();
		if (selectedReport.value === "tasks") await onGetDataTask();
		if (selectedReport.value === "attendance") await onGetDataAttendance();
	} finally {
		loading.value = false;
	}
};

const onResetCurrentFilters = () => {
	if (selectedReport.value === "projects") {
		projectFilters.value = { status: [], startDateFrom: null, startDateTo: null, endDateFrom: null, endDateTo: null };
		return;
	}

	if (selectedReport.value === "tasks") {
		taskFilters.value = {
			projects: [],
			users: [],
			status: [],
			dueDateFrom: null,
			dueDateTo: null,
			completedAtFrom: null,
			completedAtTo: null,
			sortBy: null
		};
		return;
	}

	attendanceFilters.value = { from: null, to: null, userId: null };
};

onMounted(async() => {
	await onGetAllUsers();
	await onGetAllProjects();
});
</script>

<template>
	<div class="report-view">
		<div class="grid w-full max-w-6xl grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-3">
			<div v-for="opt in optionsToPrint" :key="opt.key" class="view-card-route report-card"
			     :class="{ 'report-card--active': selectedReport === opt.key }" @click="selectedReport = opt.key">
				<component :is="opt.icon" class="text-6xl text-primary-600 dark:text-white"/>
				<span class="text-xl font-semibold text-gray-900 dark:text-white">{{ opt.label }}</span>
			</div>
		</div>

		<Card class="report-filters mt-4" #content>
			<h3 class="m-0 text-xl">Filtros de {{ optionsToPrint.find(item => item.key === selectedReport)?.label }}</h3>
			<p class="m-0 text-sm text-surface-500 dark:text-surface-300">{{ currentReportDescription }}</p>

			<div v-if="selectedReport === 'projects'" class="align-items-form mt-3">
				<ValidateFormItem span="6" label="Estados (múltiple)">
					<MultiSelect v-model="projectFilters.status" fluid :options="optionsProjectStatus" optionLabel="label"
					             optionValue="value" filter resetFilterOnClear placeholder="Todos los estados"/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Inicio desde">
					<DatePicker v-model="projectFilters.startDateFrom" fluid show-icon/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Inicio hasta">
					<DatePicker v-model="projectFilters.startDateTo" fluid show-icon :minDate="projectFilters.startDateFrom ?? undefined"/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Fin desde">
					<DatePicker v-model="projectFilters.endDateFrom" fluid show-icon/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Fin hasta">
					<DatePicker v-model="projectFilters.endDateTo" fluid show-icon :minDate="projectFilters.endDateFrom ?? undefined"/>
				</ValidateFormItem>
			</div>

			<div v-if="selectedReport === 'tasks'" class="align-items-form mt-3">
				<ValidateFormItem span="6" label="Proyectos (múltiple)">
					<MultiSelect v-model="taskFilters.projects" fluid :options="projectsOptions" optionLabel="name" optionValue="id"
					             filter resetFilterOnClear placeholder="Todos los proyectos"/>
				</ValidateFormItem>
				<ValidateFormItem span="6" label="Trabajadores (múltiple)">
					<MultiSelect v-model="taskFilters.users" fluid :options="usersOptions"
					             :optionLabel="(data) => `${data.names} ${data.lastnames}`" optionValue="id" filter
					             resetFilterOnClear placeholder="Todos los trabajadores"/>
				</ValidateFormItem>
				<ValidateFormItem span="6" label="Estado (múltiple)">
					<MultiSelect v-model="taskFilters.status" fluid :options="optionsTaskStatus" optionLabel="label"
					             optionValue="value" filter resetFilterOnClear placeholder="Todos los estados"/>
				</ValidateFormItem>
				<ValidateFormItem span="6" label="Ordenar por">
					<Select v-model="taskFilters.sortBy" fluid :options="optionsTaskSortBy" optionLabel="label" optionValue="value"
					        placeholder="Sin orden específico"/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Vence desde">
					<DatePicker v-model="taskFilters.dueDateFrom" fluid show-icon/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Vence hasta">
					<DatePicker v-model="taskFilters.dueDateTo" fluid show-icon :minDate="taskFilters.dueDateFrom ?? undefined"/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Completada desde">
					<DatePicker v-model="taskFilters.completedAtFrom" fluid show-icon/>
				</ValidateFormItem>
				<ValidateFormItem span="3" label="Completada hasta">
					<DatePicker v-model="taskFilters.completedAtTo" fluid show-icon
					            :minDate="taskFilters.completedAtFrom ?? undefined"/>
				</ValidateFormItem>
			</div>

			<div v-if="selectedReport === 'attendance'" class="align-items-form mt-3">
				<ValidateFormItem span="4" label="Fecha desde">
					<DatePicker v-model="attendanceFilters.from" :maxDate="new Date()" fluid show-icon/>
				</ValidateFormItem>
				<ValidateFormItem span="4" label="Fecha hasta">
					<DatePicker v-model="attendanceFilters.to" :maxDate="new Date()" :minDate="attendanceFilters.from ?? undefined"
					            fluid show-icon/>
				</ValidateFormItem>
				<ValidateFormItem span="4" label="Trabajador">
					<Select v-model="attendanceFilters.userId" fluid :options="usersOptions"
					        :optionLabel="(data) => `${data.names} ${data.lastnames}`" optionValue="id"
					        placeholder="Todos los trabajadores"/>
				</ValidateFormItem>
			</div>

			<div class="mt-3 flex flex-col gap-2 sm:flex-row">
				<Button label="Limpiar filtros" severity="secondary" outlined @click="onResetCurrentFilters"/>
				<Button label="Descargar PDF" :loading="loading" @click="onGenerateReport" #icon>
					<i-material-symbols-download-rounded/>
				</Button>
			</div>
		</Card>
	</div>
</template>

<style scoped>
.report-view {
	align-items: center;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	min-height: 80vh;
	padding: 1rem;
}

.report-card--active {
	border: 2px solid rgb(37 99 235 / 2);
	box-shadow: 0 0 0 1px rgb(37 99 235 / 0.2);
}

.report-filters {
	border: 1px solid rgba(100, 116, 139, 0.2);
	border-radius: 0.75rem;
	max-width: 72rem;
	padding: 1rem;
	width: 100%;
}
</style>

