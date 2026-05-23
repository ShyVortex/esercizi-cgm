import type { User } from "../types/User";

export interface GetFPUsersResponse {
    first: number;
    prev: number | null;
    next: number | null;
    last: number;
    pages: number;
    items: number;
    data: User[];
}

export type GetUsersResponse = GetFPUsersResponse | User[];