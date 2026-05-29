import type { InterfaceAxiosApiPaginate } from "@/types/InterfaceAxiosApi.ts";

export interface CommentInterface {
    id: number;
    full_name: string;
    comment: string;
    rating: number;
    approved: boolean;
    created_at?: string;
    updated_at?: string;
}

export type CommentsGet = InterfaceAxiosApiPaginate<CommentInterface>;

