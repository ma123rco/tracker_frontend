<script setup lang="ts">
import { computed, h } from "vue";
import type { TasksInterface, AssignedUser } from "@/types/ProjectsInterface";
import { parseDateLocal } from "@/composables/convertDates.ts";
import { useModal } from "@/composables/useModal.ts";
import TaskDetailModal from "@/pages/private/task/TaskDetailModal.vue";

const props = defineProps<{ task: TasksInterface, getNewData: () => Promise<void> }>();

const { closeModal, openModal } = useModal();

const MAX_USERS = 2;

/* Estado de vencimiento */
const estadoVencimiento = computed<"expired" | "to_expire" | "normal">(() => {
    // Si la tarea ya está completada, nunca mostrar en rojo
    if (props.task.status === "completed") return "normal";

    const due = parseDateLocal(props.task.due_date);
    if ( !due) return "normal";

    const diff = due.getTime() - Date.now();
    const dias = diff / (1000 * 60 * 60 * 24);

    if (diff < 0) return "expired";
    if (dias <= 1) return "to_expire";
    return "normal";
});

/* Usuarios visibles */
const visibleUsers = computed<AssignedUser[]>(() =>
    props.task.users?.slice(0, MAX_USERS) ?? []
);

const remainingUsers = computed<number>(() => {
    const total = props.task.users?.length ?? 0;
    return total > MAX_USERS ? total - MAX_USERS : 0;
});

/* Formato de fecha */
const formattedDate = computed<string>(() => {
    const d = parseDateLocal(props.task.due_date);
    if ( !d) return "";
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "long" });
});

const hasLocation = computed<boolean>(() => !!props.task.location);
const imageCount = computed<number>(() => {
    let count = 0;
    if (props.task.photo1) count++;
    if (props.task.photo2) count++;
    return count;
});
const hasImages = computed<boolean>(() => imageCount.value > 0);

const getUserPhotoUrl = (photo?: string | null): string => {
    if (typeof photo !== "string") return "";
    return photo.trim();
};

const getUserInitials = (user: AssignedUser): string => {
    return `${ user.names?.trim().charAt(0) ?? "" }${ user.lastnames?.trim().charAt(0) ?? "" }`.toUpperCase() || "--";
};

const openTaskDetailClick = (task: TasksInterface) => {
    openModal({
        breakpoints: {
            "1100px": "80vw",
            "640px": "98vw",
            "950px": "95vw"
        },
        component: h(TaskDetailModal, {
            closeModal,
            task,
            reloadData: () => props.getNewData()
        }),
        header: task.title,
        width: "70vw"
    });
};

</script>

<template>
    <article class="task-card"
             :class="{ 'expired-card': estadoVencimiento === 'expired', 'to-expired-card': estadoVencimiento === 'to_expire' }"
             @click="openTaskDetailClick(props.task)">

        <!-- Header con título y estado -->
        <header class="flex items-start justify-between gap-2 mb-2.5">
            <h3 class="text-base font-semibold leading-snug text-slate-900 dark:text-white flex-1 line-clamp-2">
                {{ task.title }}
            </h3>
        </header>

        <!-- Descripción -->
        <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-3.5 leading-relaxed">
            {{ task.description }}
        </p>

        <!-- Indicadores -->
        <div class="flex items-center flex-wrap gap-2.5 mb-3.5 text-xs">
            <!-- Fecha de vencimiento -->
            <div v-if="task.due_date"
                 class="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <i-material-symbols-event-rounded class="text-sm"/>
                {{ formattedDate }}
            </div>

            <!-- Ubicación -->
            <div v-if="hasLocation"
                 class="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                <i-material-symbols-location-on-rounded class="text-sm"/>
                Ubicación
            </div>

            <!-- Imágenes -->
            <div v-if="hasImages"
                 class="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <i-material-symbols-image-rounded class="text-sm"/>
                {{ imageCount }}
            </div>
        </div>

        <!-- Footer con usuarios -->
        <footer class="flex items-center justify-between pt-2.5 border-t border-slate-200 dark:border-slate-600">
            <div class="flex items-center gap-1">
                <i-material-symbols-person-rounded class="text-sm text-slate-500 dark:text-slate-400"/>
                <div class="flex items-center gap-0.5">
                    <span v-for="user in visibleUsers" :key="user.id" class="user-chip" v-tooltip="`${user.names} ${user.lastnames}`">
                        <img v-if="getUserPhotoUrl(user.photo)" :src="getUserPhotoUrl(user.photo)" :alt="`${user.names} ${user.lastnames}`"
                             class="user-chip-image">
                        <span v-else>{{ getUserInitials(user) }}</span>
                    </span>
                    <span v-if="remainingUsers > 0" class="user-chip user-chip--more"> 
                        +{{ remainingUsers }} 
                    </span>
                </div>
            </div>

        </footer>
    </article>
</template>

<style scoped>
@reference "@/style.css";

.task-card {
    @apply break-inside-avoid border border-slate-300 dark:border-slate-600
    rounded-lg cursor-pointer bg-white dark:bg-slate-800
    p-3.5 shadow-sm hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50
    transition-all duration-300 transform hover:-translate-y-1 min-h-28;
}

.expired-card {
    @apply border-red-500 bg-red-50 dark:bg-red-900/20;
}

.to-expired-card {
    @apply border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20;
}

.user-chip {
    @apply flex h-7 w-7 items-center justify-center
    rounded-full bg-slate-300 dark:bg-slate-600
    overflow-hidden
    text-[11px] font-bold text-slate-800 dark:text-slate-100
    hover:ring-2 hover:ring-offset-1 hover:ring-primary transition-all;
}

.user-chip-image {
    @apply h-full w-full object-cover;
}

.user-chip--more {
    @apply bg-primary text-white dark:text-slate-900;
}
</style>