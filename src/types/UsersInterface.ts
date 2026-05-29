import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export interface UserInterface {
    ci: string;
    created_at: string;
    readonly id: number;
    lastnames: string;
    names: string;
    /**
     *
     * this field only comes in the user list.
     */
    password_hash: string;
    photo?: string | null;
    role: "Admin" | "Gerente" | "Tecnico" | "Secretaria";
    status: boolean;
    updated_at: string;
    username: string;
}

export type ResponseUserInterface = InterfaceAxiosApiPaginate<UserInterface>;