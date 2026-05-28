import type { AuthStorageData } from "../models/types/AuthStorageData";
import type { User } from "../models/types/User";

export abstract class AuthStorageService {
    private static AUTH_STORAGE_KEY = 'sessionKey';

    public static getAuthData(): AuthStorageData | undefined {
        const storageItem = localStorage.getItem(this.AUTH_STORAGE_KEY);

        try {
            const storageData: AuthStorageData | undefined = storageItem
                ? JSON.parse(storageItem)
                : undefined;

            if (!storageData ||
                !Object.hasOwn(storageData, "accessToken") ||
                !Object.hasOwn(storageData, "user")
            ) {
                localStorage.removeItem(this.AUTH_STORAGE_KEY);
                return undefined;
            }

            return storageData;
        } catch {
            return undefined;
        }
    }

    public static getToken(): string | undefined {
        return this.getAuthData()?.accessToken;
    }

    public static getUser(): User | undefined {
        return this.getAuthData()?.user;
    }

    public static setAuthData(data: AuthStorageData): void {
        localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(data));
    }

    public static removeAuthData(): void {
        localStorage.removeItem(this.AUTH_STORAGE_KEY);
    }

    public static hasToken(): boolean {
        return this.getToken() !== null;
    }
}