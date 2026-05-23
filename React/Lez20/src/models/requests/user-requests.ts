export interface SaveUserRequest {
    id?: string;
    username: string;
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    isActive: boolean
}