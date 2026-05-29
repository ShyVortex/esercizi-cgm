import type { Role } from "../types/User";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    username: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    role: Role;
}