<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { h, onMounted, ref } from "vue";
import { useModal } from "@/composables/useModal.ts";
import ManageProjects from "@/pages/private/projects/ManageProjects.vue";
import { onGetStatusProject, type ProjectsInterface, type ResponseProjectsInterface } from "@/types/ProjectsInterface.ts";
import { formatDateToString, parseToDate } from "@/composables/convertDates.ts";
import AssignTask from "@/pages/private/projects/AssignTask.vue";
import ViewTaskByProject from "@/pages/private/projects/ViewTaskByProject.vue";

const { openModal, closeModal } = useModal();
const projectsData = ref<ProjectsInterface[]>([]);
const loading = ref(false);

const onGetProjectsData = async() => {
    loading.value = true;
    const { response }: ResponseProjectsInterface = await Api.Get({ route: "projects" });
    if (response && [ 200, 201 ].includes(response.status)) {
        projectsData.value = response.data.data;
        loading.value = false;
    }
};

const onManageProjects = (data?: ProjectsInterface) => {
    openModal({
        component: h(ManageProjects, {
            closeModal,
            reloadData: onGetProjectsData,
            form: data?.id ? {
                ...data,
                end_date: data?.end_date ? parseToDate(data.end_date as string) : null,
                start_date: data?.start_date ? parseToDate(data.start_date as string) : null
            } : undefined
        }),
        header: data?.id ? `Editar proyecto ${ data.name }` : `Nuevo proyecto`,
        width: "55vw"
    });
};

const onManageTaskProjects = (data?: ProjectsInterface) => {
    openModal({
        component: h(AssignTask, {
            closeModal,
            projectId: data?.id as number,
            reloadData: onGetProjectsData
        }),
        header: data?.id ? `Asignar tareas a ${ data.name }` : `Nueva tarea`,
        width: "55vw"
    });
};

const onManageListTaskByProjects = (data?: ProjectsInterface) => {
    openModal({
        component: h(ViewTaskByProject, {
            closeModal,
            idProject: data?.id as number,
            reloadData: onGetProjectsData
        }),
        header: `Ver tareas del proyecto ${ data?.name }`,
        width: "55vw"
    });
};

onMounted(() => onGetProjectsData());

</script>

<template>
    <div class="align-header my-4">
        <p class="font-semibold text-xl"> Lista de proyectos </p>
        <div class="flex gap-2 flex-wrap">
            <Button label="Nueva tarea a proyecto" severity="success" @click="onManageTaskProjects()" v-if="projectsData.length" #icon>
                <i-material-symbols-temp-preferences-eco/>
            </Button>
            <Button label="Nuevo proyecto" @click="onManageProjects()" #icon>
                <i-material-symbols-temp-preferences-eco/>
            </Button>
        </div>
    </div>
    <Card #content>
        <DataTable show-gridlines lazy table-class="min-w-[70rem]" dataKey="id" :value="projectsData" :loading>
            <template #empty>
                <EmptyTable/>
            </template>
            <template #loading>
                <LoadingPage/>
            </template>
            <Column header="Acciones" class="w-4!" #body="{ data }">
                <div class="flex gap-2 w-auto">
                    <Button size="small" class="p-1.5!" @click="onManageProjects(data)" v-tooltip="'Editar proyecto'">
                        <i-material-symbols-edit-document-rounded class="text-lg"/>
                    </Button>
                    <Button size="small" class="p-1.5!" severity="info" @click="onManageTaskProjects(data)" v-tooltip="'Agregar tareas'">
                        <i-material-symbols-add-task-rounded class="text-lg"/>
                    </Button>
                    <Button size="small" class="p-1.5!" severity="success" @click="onManageListTaskByProjects(data)"
                            v-tooltip="'Ver tareas'">
                        <i-material-symbols-visibility-rounded class="text-lg"/>
                    </Button>
                </div>
            </Column>
            <Column field="name" class="w-32" header="Proyecto"/>
            <Column field="description" class="w-48" header="Descripción"/>
            <Column field="start_date" class="w-14" header="F. inicio" #body="{ data }">
                {{ data?.start_date ? formatDateToString(data?.start_date) : "-" }}
            </Column>
            <Column field="end_date" class="w-14" header="F. fin" #body="{ data }">
                {{ data?.end_date ? formatDateToString(data?.end_date) : "-" }}
            </Column>
            <Column field="status" class="w-28" header="Estado" #body="{ data }">
	            {{ onGetStatusProject(data.status) }}
            </Column>
        </DataTable>
    </Card>
</template>

