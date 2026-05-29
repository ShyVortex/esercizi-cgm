export const Role = {
    READER: 'reader',
    EDITOR: 'editor',
    ADMIN: 'admin'
} as const;

export type Role = typeof Role[keyof typeof Role];

export type User = {
    id: string;
    email: string;
    password?: string;
    username: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    role: Role;
}