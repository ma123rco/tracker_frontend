<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import { LMap, LMarker, LTileLayer } from "@maxel01/vue-leaflet";
import { computed, onMounted, ref } from "vue";
import { useForm } from "vee-validate";
import { castFormErrors } from "@/composables/castFormErrors.ts";
import { safeParseToDate } from "@/composables/convertDates.ts";
import useGlobalToast from "@/composables/toastEvent.ts";
import type { ProjectsInterface, ResponseProjectsInterface, TasksInterface, TasksStatus } from "@/types/ProjectsInterface.ts";
import type { ResponseUserInterface, UserInterface } from "@/types/UsersInterface.ts";
import * as yup from "yup";

const props = defineProps<{ closeModal: () => void, reloadData: () => Promise<void>, form?: TasksInterface, projectId?: number }>();

type LocationSearchResult = {
    displayName: string;
    lat: number;
    lng: number;
};

const DEFAULT_CENTER: [number, number] = [ -17.31957760276381, -66.0714000934226 ];
const map = ref<any>(null);
const loading = ref(false);
const usersOptions = ref<UserInterface[]>([]);
const projectsOptions = ref<ProjectsInterface[]>([]);
const mapCenter = ref<[number, number]>(DEFAULT_CENTER);
const mapZoom = ref(8);
const locationSearch = ref("");
const locationSearchLoading = ref(false);
const locationSearchError = ref("");
const locationSearchResults = ref<LocationSearchResult[]>([]);
let locationSearchTimeout: ReturnType<typeof setTimeout> | null = null;
let locationSearchAbortController: AbortController | null = null;

const validationSchema = ref(yup.object({
    description: yup.string().required("Ingrese una descripción"),
    due_date: yup.date().required("Seleccione una fecha limite"),
    location: yup.object({
        lat: yup.number().required(),
        lng: yup.number().required()
    }).required("Seleccione una ubicación en el mapa"),
    project_id: yup.number().required("Seleccione un proyecto"),
    status: yup.string().required("Seleccione un estado"),
    title: yup.string().required("Añada un titulo de tarea"),
    userIds: yup.array().min(1).required("Seleccione un empleado")
}));

const { handleSubmit, defineField, setValues } = useForm<TasksInterface>({ validationSchema, initialValues: { status: "assigned" } });
const [ location ] = defineField("location");
const [ project_id ] = defineField("project_id");

const optionsStatusTask = ref<{ label: string, value: TasksStatus }[]>([
    { label: "Asignada", value: "assigned" },
    { label: "Pendiente", value: "pending" },
    { label: "En progreso...", value: "in_progress" },
    { label: "Completada", value: "completed" }
]);

const hasValidLocation = computed(() => {
    const lat = Number(location.value?.lat);
    const lng = Number(location.value?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
});

const markerPosition = computed<[number, number] | null>(() => {
    if (!hasValidLocation.value) return null;
    return [ Number(location.value!.lat), Number(location.value!.lng) ];
});

const hasMissingLocationOnEdit = computed(() => Boolean(props.form?.id) && !hasValidLocation.value);

const onFocusMapTo = (lat: number, lng: number, zoom = 16) => {
    mapCenter.value = [ lat, lng ];
    mapZoom.value = zoom;
    const leafletMap = map.value?.leafletObject || map.value?.mapObject || map.value;
    if (leafletMap?.setView) {
        leafletMap.setView([ lat, lng ], zoom);
    }
};

const onSetLocation = (lat: number, lng: number) => {
    const normalizedLat = Number(lat);
    const normalizedLng = Number(lng);
    if (Number.isFinite(normalizedLat) && Number.isFinite(normalizedLng) && Math.abs(normalizedLat) <= 90 && Math.abs(normalizedLng) <= 180) {
        location.value = { lat: normalizedLat, lng: normalizedLng };
        onFocusMapTo(normalizedLat, normalizedLng);
    }
};

const onMapClick = (e: any) => {
    const lat = Number(e?.latlng?.lat);
    const lng = Number(e?.latlng?.lng);
    onSetLocation(lat, lng);
};

const onMarkedDragged = (e: any) => {
    const lat = Number(e?.lat ?? e?.latlng?.lat);
    const lng = Number(e?.lng ?? e?.latlng?.lng);
    onSetLocation(lat, lng);
};

const onSearchLocations = async(query: string) => {
    if (query.trim().length < 3) {
        locationSearchResults.value = [];
        locationSearchError.value = "";
        locationSearchLoading.value = false;
        return;
    }

    try {
        if (locationSearchAbortController) locationSearchAbortController.abort();
        locationSearchAbortController = new AbortController();
        locationSearchLoading.value = true;
        locationSearchError.value = "";

        const encodedQuery = encodeURIComponent(query.trim());
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=7&accept-language=es&q=${ encodedQuery }`;
        const response = await fetch(url, {
            method: "GET",
            signal: locationSearchAbortController.signal,
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            locationSearchError.value = "No se pudieron obtener resultados, intenta de nuevo.";
            locationSearchResults.value = [];
            return;
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            locationSearchResults.value = [];
            return;
        }

        locationSearchResults.value = data
            .map((item: any) => ({
                displayName: item?.display_name || "Ubicación sin nombre",
                lat: Number(item?.lat),
                lng: Number(item?.lon)
            }))
            .filter((item: LocationSearchResult) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    } catch (error: any) {
        if (error?.name !== "AbortError") {
            locationSearchError.value = "No se pudieron obtener resultados, intenta de nuevo.";
            locationSearchResults.value = [];
        }
    } finally {
        locationSearchLoading.value = false;
    }
};

const onSearchLocationInput = (value?: string) => {
    const normalizedValue = value || "";
    locationSearch.value = normalizedValue;
    if (locationSearchTimeout) clearTimeout(locationSearchTimeout);
    locationSearchTimeout = setTimeout(() => {
        onSearchLocations(normalizedValue);
    }, 400);
};

const onSelectLocation = (result: LocationSearchResult) => {
    locationSearch.value = result.displayName;
    locationSearchResults.value = [];
    onSetLocation(result.lat, result.lng);
};

const onGetAllUsers = async() => {
    const { response }: ResponseUserInterface = await Api.Get({ route: "users" });
    if (response && response.status === 200) {
        usersOptions.value = response.data.data.filter(dt => dt.role !== "Admin");
    }
};

const onGetAllProjects = async() => {
    const { response }: ResponseProjectsInterface = await Api.Get({ route: "projects" });
    if (response && response.status === 200) {
        projectsOptions.value = response.data.data;
    }
};

const onManageTaskForm = handleSubmit(async(values) => {
    try {
        loading.value = true;
        const isEdit = values?.id;
        const route = isEdit ? `projects/${ project_id.value }/tasks/${ values.id }` : `projects/${ project_id.value }/tasks`;
        const method = isEdit ? Api.Put : Api.Post;
        const { response } = await method({ route, data: { ...values, location: location.value } });
        if (response && [ 200, 201 ].includes(response.status)) {
            useGlobalToast({ summary: isEdit ? "Tarea actualizada" : "Tarea creada", severity: "success" });
            props.closeModal();
            await props.reloadData();
            loading.value = false;
        }
    } catch (e) {
        loading.value = false;
        console.log(e);
    }
}, ({ errors }) => castFormErrors(errors));

onMounted(async() => {
    if (props.projectId) project_id.value = props.projectId;
    if (props.form?.id) {
        setValues({
            ...props.form,
            userIds: props.form?.users?.map((user) => user.id),
            due_date: props.form?.due_date ? safeParseToDate(props.form?.due_date) : undefined
        });
    }

    if (props.form?.location?.lat !== undefined && props.form?.location?.lng !== undefined) {
        onSetLocation(props.form.location.lat, props.form.location.lng);
    }

    await onGetAllUsers();
    await onGetAllProjects();
});

</script>

<template>
    <div class="align-items-form">
        <ValidateFormItem mark span="8" label="Titulo" name="title" v-slot="{ value, error, handleChange, id }">
            <InputText :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" :id/>
        </ValidateFormItem>
        <ValidateFormItem mark span="4" label="F. vencimiento" name="due_date" v-slot="{ value, error, handleChange, id }">
            <DatePicker :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" :inputId="id"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="5" label="Estado" name="status" v-slot="{ value, error, handleChange, id }">
            <Select :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" :labelId="id"
                    :options="optionsStatusTask" optionLabel="label" optionValue="value"/>
        </ValidateFormItem>
        <ValidateFormItem mark span="7" label="Trabajadores" name="userIds" v-slot="{ value, error, handleChange, id }">
            <MultiSelect :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" :id :options="usersOptions"
                         :optionLabel="(data)=>`${data.names} ${data.lastnames}`" optionValue="id" filter autoFilterFocus resetFilterOnClear
                         resetFilterOnHide/>
        </ValidateFormItem>
        <ValidateFormItem mark span="12" label="Description" name="description" v-slot="{ value, error, handleChange, id }">
            <Textarea :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" :id/>
        </ValidateFormItem>
        <ValidateFormItem mark span="12" label="Proyecto" name="project_id" v-slot="{ value, error, handleChange, id }"
                          v-if="props.projectId === undefined">
            <Select :modelValue="value" fluid @update:modelValue="handleChange" :invalid="!!error" :labelId="id"
                    :options="projectsOptions" optionLabel="name" optionValue="id"/>
        </ValidateFormItem>
    </div>

    <div class="location-search">
        <InputText
            :modelValue="locationSearch"
            fluid
            placeholder="Buscar ubicación (calle, zona, ciudad...)"
            @update:modelValue="onSearchLocationInput"
        />
        <small class="text-color-secondary">Escribe al menos 3 caracteres y selecciona una coincidencia precisa.</small>

        <div v-if="locationSearchLoading" class="location-feedback">Buscando ubicaciones...</div>
        <div v-else-if="locationSearchError" class="location-feedback error">{{ locationSearchError }}</div>
        <div v-else-if="locationSearch.trim().length >= 3 && !locationSearchResults.length" class="location-feedback">Sin resultados para esa búsqueda.</div>

        <div v-if="locationSearchResults.length" class="location-results">
            <button
                v-for="(result, index) in locationSearchResults"
                :key="`${result.lat}-${result.lng}-${index}`"
                class="location-result-item"
                type="button"
                @click="onSelectLocation(result)"
            >
                {{ result.displayName }}
            </button>
        </div>
    </div>

    <div v-if="hasMissingLocationOnEdit" class="location-warning">
        Esta tarea no tiene ubicación registrada. Puedes agregarla con el buscador o haciendo clic en el mapa.
    </div>

    <div class="map-container">
        <LMap ref="map" style="height:100%; width:100%" :zoom="mapZoom" :max-zoom="18" :center="mapCenter"
              @click="onMapClick">
            <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors"/>
            <LMarker draggable v-if="markerPosition" :lat-lng="markerPosition" @update:latLng="onMarkedDragged"/>
        </LMap>
    </div>
    <div v-if="markerPosition" class="mt-2 text-sm">
        Lat: {{ markerPosition[0] }} |
        Lng: {{ markerPosition[1] }}
    </div>
    <div class="align-buttons-submit mt-4">
        <Button class="w-1/2" label="Cancelar" severity="contrast" outlined @click="props.closeModal()" :loading #icon>
            <i-material-symbols-cancel-outline-rounded/>
        </Button>
        <Button class="w-1/2" label="Guardar" @click="onManageTaskForm()" :loading #icon>
            <i-material-symbols-save-outline/>
        </Button>
    </div>
</template>

<style scoped>

.location-search {
    margin-bottom: 0.75rem;
}

.location-results {
    max-height: 220px;
    overflow: auto;
    border: 1px solid var(--p-content-border-color);
    border-radius: 0.5rem;
    margin-top: 0.5rem;
}

.location-result-item {
    width: 100%;
    text-align: left;
    padding: 0.6rem 0.75rem;
    border: 0;
    border-bottom: 1px solid var(--p-content-border-color);
    background: #ffffff;
    cursor: pointer;
}

.location-result-item:last-child {
    border-bottom: 0;
}

.location-result-item:hover {
    background: #f5f6f8;
}

.location-feedback {
    margin-top: 0.35rem;
    font-size: 0.85rem;
    color: var(--p-text-muted-color);
}

.location-feedback.error {
    color: #c62828;
}

.location-warning {
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
    border: 1px dashed #d4a017;
    color: #7a5a00;
    background: #fff8db;
    border-radius: 0.5rem;
    padding: 0.6rem 0.75rem;
}

.map-container {
    height: 40vh;
    width: 100%;
}

</style>