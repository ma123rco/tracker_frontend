<script setup lang="ts">

import { Api } from "@/api/connection.ts";
import { useModal } from "@/composables/useModal.ts";
import { h, onMounted, ref } from "vue";
import { formatDateToString } from "@/composables/convertDates.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { ResponseUserInterface, UserInterface } from "@/types/UsersInterface.ts";
import FormUsers from "@/pages/private/users/FormUsers.vue";
import ChangePassword from "@/components/ChangePassword.vue";

const { openModal, closeModal } = useModal();
const usersData = ref<UserInterface[]>([]);
const loading = ref(false);
const selectedPhotoFile = ref<File | null>(null);
const profilePhotoInputRef = ref<HTMLInputElement | null>(null);
const targetUserIdForPhoto = ref<number | null>(null);
const uploadingPhotoUserId = ref<number | null>(null);
const deletingPhotoUserId = ref<number | null>(null);
const imageBaseUrl = import.meta.env.VITE_API_URL as string | undefined;

const onGetUsersData = async() => {
	loading.value = true;
	const { response }: ResponseUserInterface = await Api.Get({ route: "users" });
	if (response && [ 200, 201 ].includes(response.status)) {
		usersData.value = response.data.data.filter(dt => dt.role !== "Admin");
		// totalRecords.value = response.data.count;
		loading.value = false;
	}
};

// const onPageChange = async(event: DataTablePageEvent): Promise<void> => {
//     currentPage.value = event.page + 1;
//     rows.value = event.rows;
//     await onGetUsersData();
// };

const onManageFormUsers = (data?: UserInterface) => {
	openModal({
		component: h(FormUsers, {
			closeModal,
			reloadData: onGetUsersData,
			form: data?.id ? { ...data } : undefined
		}),
		header: data?.id ? `Editar usuario ${ data.username }` : "Nuevo usuario",
		width: "55vw"
	});
};

const changePassword = async(data: UserInterface) => {
	openModal({
		component: h(ChangePassword, {
			userID: data.id,
			closeForm: () => closeModal()
		}),
		header: "Cambiar contraseña"
	});
};

const getImageUrl = (url?: string | null): string => {
	if ( !url) return "";
	if (url.startsWith("http")) return url;
	return `${ imageBaseUrl ?? "" }${ url.startsWith("/") ? url : `/${ url }` }`;
};

const getUserPhotoUrl = (user?: UserInterface): string => {
	const rawPhoto = user?.photo;
	if (typeof rawPhoto !== "string" || !rawPhoto.trim()) return "";
	return getImageUrl(rawPhoto);
};

const isRowPhotoBusy = (userId?: number): boolean => {
	if ( !userId) return false;
	return uploadingPhotoUserId.value === userId || deletingPhotoUserId.value === userId;
};

const onOpenPhotoPicker = (user: UserInterface): void => {
	if ( !user?.id || user.role !== "Tecnico" || isRowPhotoBusy(user.id)) return;
	targetUserIdForPhoto.value = user.id;
	profilePhotoInputRef.value?.click();
};

const onPhotoSelected = async(event: Event): Promise<void> => {
	const input = event.target as HTMLInputElement;
	const file = input.files?.[0] ?? null;
	const userId = targetUserIdForPhoto.value;

	input.value = "";

	if ( !file || !userId) return;

	if ( !file.type.startsWith("image/")) {
		useGlobalToast({ summary: "Seleccione un archivo de imagen válido", severity: "warn" });
		return;
	}

	try {
		uploadingPhotoUserId.value = userId;
		selectedPhotoFile.value = file;
		const formData = new FormData();
		formData.append("photo", selectedPhotoFile.value);

		const { response } = await Api.Post({ route: `users/${ userId }/photo`, data: formData });
		if (response && [ 200, 201 ].includes(response.status)) {
			useGlobalToast({ summary: "Foto actualizada correctamente", severity: "success" });
			await onGetUsersData();
		}
	} catch (error) {
		console.error(error);
	} finally {
		selectedPhotoFile.value = null;
		uploadingPhotoUserId.value = null;
		targetUserIdForPhoto.value = null;
	}
};

const onDeleteUserPhoto = async(user: UserInterface): Promise<void> => {
	if ( !user?.id || user.role !== "Tecnico" || isRowPhotoBusy(user.id) || !getUserPhotoUrl(user)) return;

	try {
		deletingPhotoUserId.value = user.id;
		const { response } = await Api.Destroy({ route: `users/${ user.id }/photo` });
		if (response && [ 200, 201 ].includes(response.status)) {
			useGlobalToast({ summary: "Foto eliminada correctamente", severity: "success" });
			await onGetUsersData();
		}
	} catch (error) {
		console.error(error);
	} finally {
		deletingPhotoUserId.value = null;
	}
};

onMounted(() => onGetUsersData());

</script>

<template>
	<div class="align-header mb-4">
		<p class="font-semibold text-xl"> Lista de usuarios </p>
		<Button label="Nuevo usuario" class="ml-auto" @click="onManageFormUsers()" #icon>
			<i-material-symbols-person-add-outline-rounded/>
		</Button>
	</div>
	<input ref="profilePhotoInputRef" type="file" class="hidden" accept="image/*" @change="onPhotoSelected">
	<Card #content>
		<DataTable show-gridlines lazy table-class="min-w-[80rem]" dataKey="id" :value="usersData" :loading>
			<template #empty>
				<EmptyTable/>
			</template>
			<template #loading>
				<LoadingPage/>
			</template>
			<Column field="created_at" class="w-2" header="Acciones" #body="{ data }">
				<div class="flex gap-2 w-auto flex-wrap">
					<Button class="px-1.5!" size="small" @click="onManageFormUsers(data)">
						<i-material-symbols-edit class="text-lg"/>
					</Button>
					<Button class="px-1.5!" size="small" severity="info" @click="changePassword(data)">
						<i-material-symbols-password-rounded class="text-lg"/>
					</Button>
				</div>
			</Column>
			<Column field="photo" class="w-24" header="Foto" #body="{ data }">
				<div v-if="data.role === 'Tecnico'" class="flex items-center justify-center min-h-10">
					<div class="flex items-center gap-2 flex-wrap justify-center">
						<div class="flex gap-1.5 flex-wrap w-full items-center justify-center">
							<Image v-if="getUserPhotoUrl(data)" :src="getUserPhotoUrl(data)" alt="Foto de técnico" preview
							       imageClass="h-14 w-14 rounded-full object-cover border border-surface-200 dark:border-surface-700"/>
							<Button severity="contrast" :loading="uploadingPhotoUserId === data.id" :disabled="isRowPhotoBusy(data.id)"
							        @click="onOpenPhotoPicker(data)" fluid
							        v-tooltip="`${data.photo === null ? 'Subir' : 'Actualizar'} foto`" #icon>
								<i-material-symbols-photo-camera-front-rounded class="text-xl!" v-if="data.photo === null"/>
								<i-material-symbols-sync-rounded class="text-xl!" v-else/>
							</Button>
							<Button v-if="getUserPhotoUrl(data)" severity="danger" :loading="deletingPhotoUserId === data.id"
							        :disabled="isRowPhotoBusy(data.id)" @click="onDeleteUserPhoto(data)" fluid v-tooltip="'Eliminar foto'"
							        #icon>
								<i-material-symbols-delete-outline-rounded class="text-xl!"/>
							</Button>
						</div>
					</div>
				</div>
				<span v-else class="text-xs text-surface-400">-</span>
			</Column>
			<Column field="created_at" class="w-12" header="F. Creación" #body="{ data }">
				{{ data?.created_at ? formatDateToString(data?.created_at) : "-" }}
			</Column>
			<Column field="username" class="w-32" header="Usuario"/>
			<Column field="names" class="w-48" header="Nombres"/>
			<Column field="lastnames" class="w-48" header="Nombres"/>
			<Column field="role" class="w-24" header="Perfil" #body="{ data }">
				{{ data.role === "Usuario" ? "Secretaria" : data.role }}
			</Column>
		</DataTable>
	</Card>
</template>
