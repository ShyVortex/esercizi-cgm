import type { Role } from "../types/User";

export interface GetFPUsersRequest {
    page?: number;
    limit?: number;
    filter?: string;
}

export interface SaveUserRequest {
    id?: string;
    username: string;
    email: string;
    password?: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    role?: Role;
    permissions?: string[];
}