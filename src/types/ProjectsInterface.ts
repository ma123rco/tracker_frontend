import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export type StatusProject = "pending" | "doing" | "closed" | "open" | 'in_progress'

export interface ProjectsInterface {
    description: string;
    end_date: string | Date | null;
    readonly id?: number;
    name: string;
    start_date: string | Date | null;
    status: StatusProject;
}

export interface TaskColumnsInterface {
    cards: TasksInterface[];
    description: string;
    id: TasksStatus;
    title: string;
}

export type TasksStatus = "pending" | "assigned" | "in_progress" | "completed"
// export type TaskFilterPeriod = "today" | "week" | "month"

export interface TasksInterface {
    /**
     * Date of completion
     */
    // completed_at: string | Date | null;
    description: string;
    /**
     * Max date for the task
     */
    due_date: string | Date | null;
    readonly id?: number;
    /**
     * Latitude and longitude of the location
     */
    location: { lat: number; lng: number; } | null;
    photo1: string | null;
    photo2: string | null;
    /**
     * ID of the project
     */
    project_id: number;
    status: TasksStatus;
    title: string;
    userIds: number[];
    readonly users?: AssignedUser[];
}

export interface AssignedUser {
    id: number;
    lastnames: string;
    names: string;
    photo: null | string;
    role: string;
    status: boolean;
    username: string;
}

export interface TaskReportInterface {
    id: number;
    project_id: number;
    title: string;
    description: string;
    status: TasksStatus;
    due_date: string;
    location: { lat: number; lng: number; } | null;
    employee_name: string;
}

export const onGetStatusProject = (status: StatusProject) => {
    switch (status) {
        case "pending":
            return "Pendiente";
        case "in_progress":
            return "En progreso";
        case "open":
            return "Abierto";
        case "closed":
            return "Cerrado";
        default:
            return "Desconocido";
    }
};

export const onGetStatusTask = (status: TasksStatus) => {
    switch (status) {
        case "pending":
            return "Pendiente";
        case "assigned":
            return "Asignado";
        case "in_progress":
            return "En progreso";
        case "completed":
            return "Completado";
        default:
            return "Desconocido";
    }
};

export interface DashboardOverdueTask {
    dueDate: string | null;
    id: number;
    projectName: string;
    title: string;
}

export interface DashboardRecentTask {
    completedAt?: string | null;
    completed_at?: string | null;
    id?: number;
    projectName?: string;
    project_name?: string;
    title?: string;
}

export interface DashboardRecentCheckin {
    checkedAt?: string | null;
    checked_at?: string | null;
    id?: number;
    projectName?: string;
    project_name?: string;
    technicianName?: string;
    type?: string;
    userName?: string;
    user_name?: string;
}

export interface DashboardTopTechnician {
    avgHours?: number;
    checkins?: number;
    completedTasks?: number;
    fullName?: string;
    id?: number;
    name?: string;
    tasksCompleted?: number;
}

export interface DashboardData {
    attendance: { avgHours: number; checkinsToday: number; presentToday: number; };
    contacts: { pending: number; };
    overdueTasks: DashboardOverdueTask[];
    projects: { closed: number; in_progress: number; open: number; total: number; };
    recentCheckins: DashboardRecentCheckin[];
    recentTasks: DashboardRecentTask[];
    tasks: { completed: number; in_progress: number; overdue: number; pending: number; total: number; };
    topTechnicians: DashboardTopTechnician[];
    users: { active: number; total: number; };
}

export type TaskAssignmentGet = InterfaceAxiosApiPaginate<TasksInterface>;
export type TaskReportAssignmentGet = InterfaceAxiosApiPaginate<TaskReportInterface>;

export type ResponseProjectsInterface = InterfaceAxiosApiPaginate<ProjectsInterface>;
