<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { userDataConfig } from "@/store/layout/storeUserData.ts";
import { h, computed, onMounted, ref } from "vue";
import { formatDateToString } from "@/composables/convertDates.ts";
import { useModal } from "@/composables/useModal.ts";
import { useConfirm } from "primevue";
import ViewLocationMap from "@/components/ViewLocationMap.vue";
import type { AttendanceInterface, AttendanceInterfaceGet } from "@/types/AttendanceInterface.ts";
import type { ResponseUserInterface, UserInterface } from "@/types/UsersInterface.ts";

const { openModal } = useModal();
const confirm = useConfirm();
const userStore = userDataConfig();
const dataAttendance = ref<AttendanceInterface[]>([]);
const userOptions = ref<UserInterface[]>([]);
const loading = ref(false);

const filters = ref<{ userId: number | null; from: Date | null; to: Date | null }>({
	userId: null,
	from: null,
	to: null
});

const currentUser = computed(() => userStore.userData?.user);
const isTecnico = computed(() => currentUser.value?.role === "Tecnico");
const canSelectUsers = computed(() => [ "Admin", "Gerente", "Secretaria" ].includes(currentUser.value?.role ?? ""));

const onGetUsers = async() => {
	if ( !canSelectUsers.value) {
		if (currentUser.value?.id) {
			userOptions.value = [ currentUser.value as UserInterface ];
		}
		return;
	}

	const { response }: ResponseUserInterface = await Api.Get({ route: "users" });
	if (response && response.status === 200) {
		userOptions.value = response.data.data.filter(user => user.role !== "Admin");
	}
};

const onGetAttendance = async() => {
	try {
		loading.value = true;

		const params: Record<string, unknown> = {};

		if (isTecnico.value && currentUser.value?.id) {
			params.userId = currentUser.value.id;
			filters.value.userId = currentUser.value.id;
		} else if (filters.value.userId) {
			params.userId = filters.value.userId;
		}

		if (filters.value.from) params.from = filters.value.from.toISOString();
		if (filters.value.to) params.to = filters.value.to.toISOString();

		const { response }: AttendanceInterfaceGet = await Api.Get({ route: "reports/attendance", params });
		if (response && [ 200, 201 ].includes(response.status)) {
			dataAttendance.value = response.data.data;
		}
	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const onClearFilters = async() => {
	filters.value = {
		userId: isTecnico.value ? currentUser.value?.id ?? null : null,
		from: null,
		to: null
	};
	await onGetAttendance();
};

const onViewTaskLocation = (data?: AttendanceInterface) => {
	if ( !data?.latitud && !data?.longitud) return;
	openModal({
		component: h(ViewLocationMap, {
			location: {
				lat: data?.latitud,
				lng: data?.longitud
			}
		}),
		header: `Marcación de ${ data?.employee_name }`,
		width: "30vw"
	});
};

const onConfirmDeleteAttendance = (data?: AttendanceInterface) => {
	confirm.require({
		accept: async() => {
			try {
				if ( !data?.id) return;
				loading.value = true;
				const { response } = await Api.Destroy({ route: `attendance/${ data.id }` });
				if (response && [ 200, 201 ].includes(response.status)) {
					await onGetAttendance();
				}
			} catch (e) {
				console.error(e);
			} finally {
				loading.value = false;
			}
		},
		acceptLabel: "Sí, eliminar",
		header: "Confirmar eliminación",
		message: "¿Está seguro que desea eliminar esta marcación?",
		rejectLabel: "No, cancelar",
		rejectClass: "p-button-secondary",
		acceptClass: "p-button-danger"
	});
};

onMounted(async() => {
	if (isTecnico.value && currentUser.value?.id) {
		filters.value.userId = currentUser.value.id;
	}
	await onGetUsers();
	await onGetAttendance();
});

</script>

<template>
	<div class="align-header">
		<p class="font-semibold text-xl mb-4">Lista de asistencias</p>
	</div>

	<Card class="mb-3" #content>
		<div class="align-items-form">
			<ValidateFormItem span="4" label="Trabajador">
				<Select v-model="filters.userId" fluid :options="userOptions"
				        :optionLabel="(data) => `${data.names} ${data.lastnames}`" optionValue="id"
				        placeholder="Todos" :disabled="isTecnico"/>
			</ValidateFormItem>
			<ValidateFormItem span="4" label="Desde">
				<DatePicker v-model="filters.from" fluid showTime hourFormat="24" showIcon/>
			</ValidateFormItem>
			<ValidateFormItem span="4" label="Hasta">
				<DatePicker v-model="filters.to" fluid showTime hourFormat="24" showIcon :minDate="filters.from ?? undefined"/>
			</ValidateFormItem>
		</div>
		<div class="mt-2 flex gap-2 justify-end">
			<Button label="Limpiar" severity="secondary" outlined @click="onClearFilters"/>
			<Button label="Filtrar" :loading="loading" @click="onGetAttendance"/>
		</div>
	</Card>

	<Card #content>
		<DataTable :value="dataAttendance" :loading="loading" tableStyle="min-width: 50rem" showGridlines stripedRows>
			<template #loading>
				<LoadingPage/>
			</template>
			<template #empty>
				<EmptyTable/>
			</template>
			<Column header="Acciones" field="location" #body="{ data }">
				<div class="flex gap-2 flex-wrap">
					<Button size="small" class="p-1!" @click="onViewTaskLocation(data)" v-tooltip="'Ver ubicación'" #icon>
						<i-material-symbols-location-on class="text-lg!"/>
					</Button>
					<Button severity="danger" size="small" class="p-1!" @click="onConfirmDeleteAttendance(data)"
					        v-tooltip="'Eliminar marcación'" #icon>
						<i-material-symbols-delete-outline-rounded class="text-lg!"/>
					</Button>
				</div>
			</Column>
			<Column header="Empleado" field="employee_name"/>
			<Column header="Entrada" field="checked_in_at" #body="{ data }">
				{{ data?.checked_in_at ? formatDateToString(data?.checked_in_at, "dd-MM-yyyy hh:mm:ss aa") : " - " }}
			</Column>
			<Column header="Salida" field="checked_out_at" #body="{ data }">
				{{ data?.checked_out_at ? formatDateToString(data?.checked_out_at, "dd-MM-yyyy hh:mm:ss aa") : " - " }}
			</Column>
		</DataTable>
	</Card>
</template>
