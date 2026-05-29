<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { formatDateToString } from "@/composables/convertDates.ts";
import { onMounted, ref } from "vue";
import type { ContactsInterface, ContactsInterfaceGet } from "@/types/ContactsInterface.ts";
import { type DataTablePageEvent, useConfirm } from "primevue";

const dataContacts = ref<ContactsInterface[]>([]);
const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);
const confirm = useConfirm();


const onGetDataContacts = async() => {
	try {
		loading.value = true;

		const { response }: ContactsInterfaceGet = await Api.Get({
			route: "contacts",
			params: {
				page: page.value,
				pageSize: pageSize.value
			}
		});

		if (response && response.status === 200) {
			dataContacts.value = response.data.data;
			totalRecords.value = response.data.meta.total;
		}

	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const onPageChange = (event: DataTablePageEvent) => {
	page.value = event.page + 1;
	pageSize.value = event.rows;
	onGetDataContacts();
};

const onMarkAsAttended = async(row: ContactsInterface) => {
	try {
		loading.value = true;

		const { response } = await Api.Put({
			route: `contacts/${ row.id }/attended`,
			data: {
				attended: true
			}
		});

		if (response && response.status === 200) {
			await onGetDataContacts();
		}

	} catch (e) {
		console.error(e);
	} finally {
		loading.value = false;
	}
};

const confirmAttend = (row: ContactsInterface) => {
	confirm.require({
		message: "¿Marcar este contacto como atendido?",
		header: "Confirmación",
		acceptClass: "p-button-success",
		acceptLabel: "Marcar como atendido",
		rejectLabel: "Cancelar",
		accept: () => onMarkAsAttended(row)
	});
};

onMounted(() => onGetDataContacts());

</script>

<template>
	<div class="align-header">
		<p class="font-semibold text-xl"> Lista de solicitud de contactos </p>
	</div>
	<Card #content>
		<DataTable :value="dataContacts" :loading="loading" paginator lazy :rows="pageSize" :totalRecords="totalRecords"
		           @page="onPageChange" tableStyle="min-width: 75rem; table-layout: fixed" showGridlines stripedRows>

			<Column header="Acciones" style="width:120px" #body="{ data }">
				<Button v-if="!data.attended" size="small" label="Atender" severity="success" @click="confirmAttend(data)" #icon>
					<i-material-symbols-check-circle/>
				</Button>
				<Tag v-else severity="success" value="Atendido"/>
			</Column>
			<Column field="full_name" header="Nombre" style="width:180px"/>
			<Column field="email" header="Email" style="width:200px" #body="{ data }">
                <span class="truncate block">
                    {{ data.email || "—" }}
                </span>
			</Column>
			<Column field="phone" header="Teléfono" style="width:140px"/>
			<Column field="subject" header="Asunto" style="width:180px"/>
			<Column field="message" header="Mensaje" style="width:320px" #body="{ data }">
                <span class="line-clamp-2 block">
                    {{ data.message }}
                </span>
			</Column>
			<Column header="Estado" style="width:120px" #body="{ data }">
				<Tag :severity="data.attended ? 'success' : 'warning'" :value="data.attended ? 'Atendido' : 'Pendiente'"/>
			</Column>

			<Column field="created_at" header="Fecha" style="width:200px" #body="{ data }">
				{{ formatDateToString(data.created_at, "dd-MM-yyyy hh:mm:ss aa") }}
			</Column>
		</DataTable>
	</Card>
</template>
