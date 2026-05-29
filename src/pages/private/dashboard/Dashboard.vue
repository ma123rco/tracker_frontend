<script setup lang="ts">
import { Api } from "@/api/connection.ts";
import EmptyTable from "@/components/emptyTable.vue";
import { computed, onMounted, ref } from "vue";
import { parseDateLocal, parseToDate } from "@/composables/convertDates.ts";
import type {
    DashboardData,
    DashboardOverdueTask,
    DashboardRecentCheckin,
    DashboardRecentTask,
    DashboardTopTechnician
} from "@/types/ProjectsInterface.ts";

/* ── Filtros ──────────────────────────────────────────── */
type Period = "today" | "week" | "month";

interface PeriodOption {
    label: string;
    value: Period | null;
}

const periodOptions: PeriodOption[] = [
    { label: "Todo", value: null },
    { label: "Hoy", value: "today" },
    { label: "Semanal", value: "week" },
    { label: "Mes", value: "month" }
];

const selectedPeriod = ref<Period | null>('today');
const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);

/* ── Data ─────────────────────────────────────────────── */
const loading = ref(false);
const data = ref<DashboardData | null>(null);

const onGetDashboard = async() => {
    loading.value = true;
    try {
        const params: Record<string, any> = {};

        if (selectedPeriod.value) {
            params.period = selectedPeriod.value;
        } else {
            if (fromDate.value) params.from = fromDate.value.toISOString();
            if (toDate.value) params.to = toDate.value.toISOString();
        }

        const { response } = await Api.Get({ route: "dashboard", params });
        if (response && [ 200, 201 ].includes(response.status)) {
            data.value = response.data.data as DashboardData;
        }
    } finally {
        loading.value = false;
    }
};

const onPeriodChange = () => {
    if (selectedPeriod.value) {
        fromDate.value = null;
        toDate.value = null;
    }
};

const onDateChange = () => {
    if (fromDate.value || toDate.value) {
        selectedPeriod.value = null;
    }
};

const onClearFilters = async() => {
    selectedPeriod.value = null;
    fromDate.value = null;
    toDate.value = null;
    await onGetDashboard();
};

/* ── Helpers ─────────────────────────────────────────── */
const formatFilterDate = (value: Date | null) => {
    if ( !value) return "";
    return value.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDate = (raw: string | null | undefined) => {
    const d = parseDateLocal(raw ?? null);
    if ( !d) return "—";
    return d.toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtDateTime = (raw: string | null | undefined) => {
    const d = parseToDate(raw ?? null);
    if ( !d) return "—";
    return d.toLocaleDateString("es-BO", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const isOverdue = (raw: string | null) => {
    const d = parseDateLocal(raw);
    return d ? d.getTime() < Date.now() : false;
};

const hasActiveFilters = computed(() => Boolean(selectedPeriod.value || fromDate.value || toDate.value));

const filterSummary = computed(() => {
    if (selectedPeriod.value === "today") return "Periodo: hoy";
    if (selectedPeriod.value === "week") return "Periodo: semanal";
    if (selectedPeriod.value === "month") return "Periodo: mensual";
    if (fromDate.value || toDate.value) {
        return `Rango: ${ formatFilterDate(fromDate.value) || "inicio" } → ${ formatFilterDate(toDate.value) || "fin" }`;
    }
    return "Sin filtros activos";
});

/* ── Colores ─────────────────────────────────────────── */
const ACCENT_COLORS: Record<string, string> = {
    blue: "#3b82f6",
    green: "#22c55e",
    red: "#ef4444",
    purple: "#a855f7",
    teal: "#14b8a6"
};

/* ── Cards resumen ───────────────────────────────────── */
const statCards = computed(() => {
    if ( !data.value) return [];
    const d = data.value;

    return [
        {
            id: "projects", label: "Proyectos", value: d.projects.total, accent: "blue",
            details: [
                { text: `${ d.projects.open } abiertos`, color: "#3b82f6" },
                { text: `${ d.projects.in_progress } en progreso`, color: "#eab308" },
                { text: `${ d.projects.closed } cerrados`, color: "#94a3b8" }
            ]
        },
        {
            id: "tasks", label: "Tareas", value: d.tasks.total, accent: "green",
            details: [
                { text: `${ d.tasks.pending } pendientes`, color: "#94a3b8" },
                { text: `${ d.tasks.in_progress } en progreso`, color: "#eab308" },
                { text: `${ d.tasks.completed } completadas`, color: "#22c55e" }
            ]
        },
        {
            id: "overdue", label: "Tareas Vencidas", value: d.tasks.overdue,
            accent: d.tasks.overdue > 0 ? "red" : "green",
            details: [
                { text: d.tasks.overdue > 0 ? "requieren atención" : "Al día", color: d.tasks.overdue > 0 ? "#ef4444" : "#22c55e" }
            ]
        },
        {
            id: "attendance", label: "Asistencia HOY", value: d.attendance.presentToday, accent: "purple",
            details: [
                { text: `${ d.attendance.checkinsToday } check-ins`, color: "#94a3b8" },
                { text: `~${ d.attendance.avgHours.toFixed(1) }h promedio`, color: "#94a3b8" }
            ]
        },
        {
            id: "users", label: "Usuarios", value: d.users.total, accent: "teal",
            details: [
                { text: `${ d.users.active } activos`, color: "#14b8a6" }
            ]
        }
    ];
});

/* ── Normalización de tablas futuras ─────────────────── */
const recentTasksRows = computed(() => (data.value?.recentTasks ?? []).map((task: DashboardRecentTask) => ({
    completedAt: task.completedAt ?? task.completed_at ?? null,
    id: task.id ?? 0,
    projectName: task.projectName ?? task.project_name ?? "Sin proyecto",
    title: task.title ?? "Sin título"
})));

const overdueRows = computed(() => data.value?.overdueTasks ?? []);

const topTechniciansRows = computed(() => (data.value?.topTechnicians ?? []).map((item: DashboardTopTechnician, index) => ({
    avgHours: item.avgHours ?? 0,
    checkins: item.checkins ?? 0,
    id: item.id ?? index + 1,
    name: item.fullName ?? item.name ?? `Técnico ${ index + 1 }`,
    tasksCompleted: item.tasksCompleted ?? item.completedTasks ?? 0
})));

const recentCheckinsRows = computed(() => (data.value?.recentCheckins ?? []).map((item: DashboardRecentCheckin, index) => ({
    checkedAt: item.checkedAt ?? item.checked_at ?? null,
    id: item.id ?? index + 1,
    projectName: item.projectName ?? item.project_name ?? "Sin proyecto",
    technicianName: item.technicianName ?? item.userName ?? item.user_name,
    type: item.type ?? "Check-in"
})));

onMounted(() => onGetDashboard());
</script>

<template>
    <div class="dashboard-root">

        <section class="filters-panel">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <i-material-symbols-bar-chart-4-bars-rounded class="text-2xl text-primary"/>
                        <h1 class="text-xl font-bold text-surface-800 dark:text-surface-100">Resumen General</h1>
                    </div>
                    <p class="text-sm text-surface-500 dark:text-surface-400 max-w-2xl">
                        Filtra la productividad por periodo o por un rango de fechas específico para comparar el estado actual del equipo.
                    </p>
                </div>

                <Tag :severity="hasActiveFilters ? 'info' : 'secondary'" :value="filterSummary" rounded class="self-start max-w-full"/>
            </div>

            <div class="filters-grid">
                <div class="filter-field">
                    <label class="filter-label">Período</label>
                    <Select v-model="selectedPeriod" :options="periodOptions" option-label="label" option-value="value" placeholder="Todo"
                            fluid show-clear @change="onPeriodChange"/>
                </div>

                <div class="filter-field">
                    <label class="filter-label">Desde</label>
                    <DatePicker v-model="fromDate" fluid date-format="dd/mm/yy" placeholder="dd/mm/aaaa" :disabled="!!selectedPeriod"
                                show-button-bar @update:model-value="onDateChange"/>
                </div>

                <div class="filter-field">
                    <label class="filter-label">Hasta</label>
                    <DatePicker v-model="toDate" fluid date-format="dd/mm/yy" placeholder="dd/mm/aaaa" :disabled="!!selectedPeriod"
                                :min-date="fromDate ?? undefined" show-button-bar @update:model-value="onDateChange"/>
                </div>

                <div class="actions-panel">
                    <Button label="Limpiar" severity="secondary" outlined fluid :disabled="!hasActiveFilters && !loading"
                            @click="onClearFilters" #icon>
                        <i-material-symbols-cancel-outline-rounded/>
                    </Button>
                    <Button label="Actualizar" severity="contrast" fluid :loading="loading" @click="onGetDashboard" #icon>
                        <i-material-symbols-refresh-rounded/>
                    </Button>
                </div>
            </div>
        </section>

        <template v-if="loading && !data">
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
                <Skeleton v-for="i in 5" :key="i" height="8rem" border-radius="1rem"/>
            </div>
            <Skeleton height="5.5rem" border-radius="1rem" class="mb-4"/>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Skeleton v-for="i in 4" :key="`section-${ i }`" height="18rem" border-radius="1rem"/>
            </div>
        </template>

        <template v-else-if="data">
            <section class="stats-grid">
                <div v-for="card in statCards" :key="card.id" class="stat-card" :style="{ borderLeftColor: ACCENT_COLORS[card.accent] }">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="stat-label">{{ card.label }}</p>
                            <p class="stat-value" :style="{ color: ACCENT_COLORS[card.accent] }">{{ card.value }}</p>
                        </div>
                    </div>
                    <div class="mt-2 space-y-1">
                        <p v-for="(detail, i) in card.details" :key="i" class="text-xs font-medium" :style="{ color: detail.color }">
                            {{ detail.text }}
                        </p>
                    </div>
                </div>
            </section>

            <div v-if="data.contacts.pending > 0" class="alert-banner">
                <div class="flex items-center gap-3">
                    <div class="alert-icon">
                        <i-material-symbols-mark-unread-chat-alt-rounded class="text-xl text-amber-500 shrink-0"/>
                    </div>
                    <div>
                        <p class="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Mensajes pendientes</p>
                        <p class="text-sm font-medium text-amber-900 dark:text-amber-300">
                            <span class="font-bold text-amber-500 text-lg mr-1">{{ data.contacts.pending }}</span>
                            contactos sin atender
                        </p>
                    </div>
                </div>
            </div>

            <section class="dashboard-sections-grid">
                <article class="dashboard-card section-card">
                    <div class="section-header">
                        <div class="space-y-1">
                            <div class="section-title-wrap">
                                <i-material-symbols-task-alt-rounded class="text-2xl text-primary"/>
                                <h2 class="section-title-table">Tareas recientes completadas</h2>
                            </div>
                            <p class="section-subtitle">Últimas tareas cerradas exitosamente dentro del periodo consultado.</p>
                        </div>
                        <Tag :value="String(recentTasksRows.length)" severity="secondary" rounded/>
                    </div>

                    <DataTable :value="recentTasksRows" striped-rows>
                        <Column field="id" header="ID" style="width: 72px" #body="{ data: row }">
                            <span class="font-mono text-surface-400">#{{ row.id }}</span>
                        </Column>
                        <Column field="title" header="Título"/>
                        <Column field="projectName" header="Proyecto"/>
                        <Column field="completedAt" header="Completada" #body="{ data: row }">
                            <span class="text-green-600 dark:text-green-400 font-medium">{{ fmtDateTime(row.completedAt) }}</span>
                        </Column>
                        <template #empty>
                            <EmptyTable/>
                        </template>
                    </DataTable>
                </article>

                <article class="dashboard-card section-card">
                    <div class="section-header">
                        <div class="space-y-1">
                            <div class="section-title-wrap">
                                <i-material-symbols-warning-rounded class="text-2xl text-red-500"/>
                                <h2 class="section-title-table">Tareas vencidas</h2>
                            </div>
                            <p class="section-subtitle">Tareas fuera de plazo que requieren seguimiento inmediato.</p>
                        </div>
                        <Tag :value="String(overdueRows.length)" severity="danger" rounded/>
                    </div>

                    <DataTable :value="overdueRows" striped-rows>
                        <Column field="id" header="ID" style="width: 72px" #body="{ data: row }: { data: DashboardOverdueTask }">
                            <span class="font-mono text-surface-400">#{{ row.id }}</span>

                        </Column>
                        <Column field="title" header="Título"/>
                        <Column field="projectName" header="Proyecto" #body="{ data: row }: { data: DashboardOverdueTask }">
                            <Tag :value="row.projectName" severity="secondary"/>
                        </Column>
                        <Column field="dueDate" header="Vencida" #body="{ data: row }: { data: DashboardOverdueTask }"> 
                            <span class="font-semibold"
                                  :class="isOverdue(row.dueDate) ? 'text-red-500 dark:text-red-400' : 'text-surface-600 dark:text-surface-300'">
                                {{ fmtDate(row.dueDate) }}
                            </span>
                        </Column>
                        <template #empty>
                            <EmptyTable/>
                        </template>
                    </DataTable>
                </article>

                <article class="dashboard-card section-card">
                    <div class="section-header">
                        <div class="space-y-1">
                            <div class="section-title-wrap">
                                <i-material-symbols-trophy-outline-rounded class="text-2xl text-amber-500"/>
                                <h2 class="section-title-table">Top técnicos</h2>
                            </div>
                            <p class="section-subtitle">Ranking de desempeño de técnicos según tareas completadas y actividad.</p>
                        </div>
                        <Tag :value="String(topTechniciansRows.length)" severity="warn" rounded/>
                    </div>

                    <DataTable :value="topTechniciansRows" striped-rows>
                        <Column field="name" header="Técnico"/>
                        <Column field="tasksCompleted" header="Completadas"/>
                        <Column field="checkins" header="Check-ins"/>
                        <Column field="avgHours" header="Promedio h" #body="{ data: row }">
                            <span>{{ Number(row.avgHours || 0).toFixed(1) }} h</span>
                        </Column>
                        <template #empty>
                            <EmptyTable/>
                        </template>
                    </DataTable>
                </article>

                <article class="dashboard-card section-card">
                    <div class="section-header">
                        <div class="space-y-1">
                            <div class="section-title-wrap">
                                <i-material-symbols-check-circle-outline-rounded class="text-2xl text-green-500"/>
                                <h2 class="section-title-table">Check-ins recientes</h2>
                            </div>
                            <p class="section-subtitle">Registro más reciente de entradas vinculadas a personal o proyectos.</p>
                        </div>
                        <Tag :value="String(recentCheckinsRows.length)" severity="success" rounded/>
                    </div>

                    <DataTable :value="recentCheckinsRows" striped-rows>
                        <Column field="technicianName" header="Técnico"/>
                        <Column field="projectName" header="Proyecto"/>
                        <Column field="checkedAt" header="Fecha" #body="{ data: row }">
                            <span>{{ fmtDateTime(row.checkedAt) }}</span>
                        </Column>
                        <Column field="type" header="Tipo" #body="{ data: row }">
                            <Tag :value="row.type" severity="success"/>
                        </Column>
                        <template #empty>
                            <EmptyTable/>
                        </template>
                    </DataTable>
                </article>
            </section>
        </template>
    </div>
</template>

<style scoped>
@reference "@/style.css";

.dashboard-root {
    @apply flex flex-col gap-6 px-1 pb-6;
}

.filters-panel {
    @apply rounded-2xl border border-surface-200 dark:border-surface-700 bg-linear-to-br from-white to-slate-50
    dark:from-surface-800 dark:to-surface-900 p-4 sm:p-5 shadow-sm;
}

.filters-grid {
    @apply mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(220px,0.9fr)] gap-3 items-end;
}

.filter-field {
    @apply flex flex-col gap-1.5;
}

.filter-label {
    @apply text-[11px] font-bold tracking-[0.18em] uppercase text-surface-500 dark:text-surface-400;
}

.actions-panel {
    @apply grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2;
}

.stats-grid {
    @apply grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3;
}

.stat-card {
    @apply rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/90 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md;
    border-left-width: 4px;
    border-left-style: solid;
}

.stat-label {
    @apply text-base font-bold tracking-[0.12em] uppercase text-surface-500 mb-2;
}

.stat-value {
    @apply text-3xl font-black leading-none;
}

.alert-banner {
    @apply rounded-2xl border border-amber-200 bg-amber-50/90 dark:border-amber-700/50 dark:bg-amber-900/20 px-4 py-3 shadow-sm;
}

.alert-icon {
    @apply flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 dark:bg-amber-950/40;
}

.dashboard-sections-grid {
    @apply grid grid-cols-1 2xl:grid-cols-2 gap-4;
}

.dashboard-card {
    @apply rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-4 shadow-sm;
}

.section-card {
    @apply min-h-80;
}

.section-header {
    @apply mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between;
}

.section-title-wrap {
    @apply flex items-center gap-2;
}

.section-title-table {
    @apply text-lg font-bold text-surface-800 dark:text-surface-100;
}

.section-subtitle {
    @apply text-sm text-surface-500 dark:text-surface-400;
}

</style>

