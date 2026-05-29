import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export interface AttendanceInterface {
    id: number;
    user_id: number;
    checked_in_at: string;
    checked_out_at?: string;
    latitud: number;
    longitud: number;
    employee_name: string;
}

export type AttendanceInterfaceGet = InterfaceAxiosApiPaginate<AttendanceInterface>;
