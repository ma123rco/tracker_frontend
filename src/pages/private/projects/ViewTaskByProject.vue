<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { useModal } from "@/composables/useModal.ts";
import { h, onMounted, ref } from "vue";
import { formatDateToString } from "@/composables/convertDates.ts";
import { onGetStatusTask, type TaskAssignmentGet, type TasksInterface } from "@/types/ProjectsInterface.ts";
import AssignTask from "@/pages/private/projects/AssignTask.vue";
import ViewLocationMap from "@/components/ViewLocationMap.vue";

const props = defineProps<{ closeModal: () => void, idProject: number, reloadData: () => Promise<void> }>();
const dataTaskByProject = ref<TasksInterface[]>([]);
const { openModal, closeModal } = useModal();

const onGetTasksByProject = async() => {
	const { response }: TaskAssignmentGet = await Api.Get({ route: `projects/${ props.idProject }/tasks` });
	if (response && [ 200, 201 ].includes(response.status)) {
		dataTaskByProject.value = response.data.data;
	}
};

const onManageTaskProjects = (data?: TasksInterface) => {
	openModal({
		component: h(AssignTask, {
			closeModal,
			form: data,
			projectId: data?.id as number,
			reloadData: onGetTasksByProject
		}),
		header: `Editar tarea ${ data?.title }`,
		width: "75vw"
	});
};

const onViewTaskLocation = (data?: TasksInterface) => {
	if ( !data?.location) return;
	openModal({
		component: h(ViewLocationMap, {
			location: data?.location
		}),
		header: `Ubicación de tarea: ${ data?.title }`,
		width: "30vw"
	});
};

onMounted(async() => {
	await onGetTasksByProject();
});

</script>

<template>
	<DataTable showGridlines lazy tableClass="min-w-[70rem]" dataKey="id" :value="dataTaskByProject">
		<template #empty>
			<EmptyTable/>
		</template>
		<template #loading>
			<LoadingPage/>
		</template>
		<Column #body="{ data }">
			<div class="flex gap-2 w-auto">
				<Button size="small" class="p-1.5!" v-tooltip="'Editar tarea'" @click="onManageTaskProjects(data)" #icon>
					<i-material-symbols-add-task-rounded class="text-lg"/>
				</Button>
				<Button size="small" class="p-1.5!" severity="info" v-tooltip="'Ver Ubicación'" @click="onViewTaskLocation(data)" #icon>
					<i-material-symbols-home-pin-rounded class="text-lg"/>
				</Button>
			</div>
		</Column>
		<Column field="title" header="Nombre"/>
		<Column field="description" header="Descripción"/>
		<Column field="status" header="Estado" #body="{ data }">
			{{ onGetStatusTask(data.status) }}
		</Column>
		<Column field="due_date" header="F. vencimiento" #body="{ data }">
			{{ data?.due_date ? formatDateToString(data?.due_date) : "-" }}
		</Column>
		<Column field="users" header="Empleados asignados" #body="{ data }: {data: TasksInterface}">
			<Tag v-for="dt in data.users" :key="dt.id" severity="info" :value="dt.username" class="mr-2"/>
		</Column>
	</DataTable>
</template>
