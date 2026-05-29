import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export interface ContactsInterface {
    attended: boolean;
    created_at: string;
    email?: string;
    full_name: string;
    id: number;
    message: string;
    phone: string;
    subject: string;
}

export type ContactsInterfaceGet = InterfaceAxiosApiPaginate<ContactsInterface>;