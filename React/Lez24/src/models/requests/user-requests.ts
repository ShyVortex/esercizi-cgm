export interface GetFPUsersRequest {
    page?: number;
    per_page?: number;
    filter?: string;
}

export interface SaveUserRequest {
    id?: string;
    username: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    isActive: boolean
}