export type User = {
    id: number;
    name: string;
    surname: string;
    role: string;
}

export type UsersCache = {
    data: User[];
    expiry: number;
}