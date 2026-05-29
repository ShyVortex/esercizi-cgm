import type { User } from "./User";

export type AuthStorageData = {
    accessToken: string;
    user: User;
    storedAt: number;
};
