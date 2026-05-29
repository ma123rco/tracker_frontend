// import type { InterfaceAxiosApiPaginate, InterfaceAxiosApiResponse } from "@/types/InterfaceAxiosApi.ts";

export interface DataPermissions {
    id?: null | number;
    permission: PermissionsInfo[];
    is_active: boolean;
    description: string;
}

export interface PermissionsInfo {
    name: string;
    permissions?: string[];
    children?: PermissionsInfo[];
    meta?: { permissions?: string[] };
}

export interface PermissionState {
    checked: boolean;
    partialChecked: boolean;
}

export interface TreeOptions {
    key: string;
    label: string;
    children?: Children[];
}

export interface Children {
    key: string;
    label: string;
    children?: Children[];
    checked?: boolean;
    partialChecked?: boolean;
}

// export type DataPermissionsResponse = InterfaceAxiosApiPaginate<DataPermissions>
// export type DataPermissionsResponseActions = InterfaceAxiosApiResponse<DataPermissions>