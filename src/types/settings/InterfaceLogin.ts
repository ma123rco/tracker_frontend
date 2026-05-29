import type {InterfaceAxiosApiResponse} from "@/types/InterfaceAxiosApi.ts";
import type {UserInterface} from "@/types/UsersInterface.ts";

export interface InterfaceLogin {
    token: string;
    readonly ok?: boolean;
    user: UserInterface;
}

export type InterfaceUserLoginActions = InterfaceAxiosApiResponse<InterfaceLogin>
