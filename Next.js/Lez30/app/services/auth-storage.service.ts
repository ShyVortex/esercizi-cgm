import { AuthStorageData } from "@/models/types/AuthStorageData";
import { User } from "@/models/types/User";

export abstract class AuthStorageService {
    private static AUTH_STORAGE_KEY = 'sessionKey';

    public static getAuthData(): AuthStorageData | undefined {
        if (typeof window === 'undefined') {
            return undefined;
        }
        const storageItem = localStorage.getItem(this.AUTH_STORAGE_KEY);

        try {
            const storageData: AuthStorageData | undefined = storageItem
                ? JSON.parse(storageItem)
                : undefined;

            if (!storageData ||
                !Object.hasOwn(storageData, "accessToken") ||
                !Object.hasOwn(storageData, "user") ||
                !Object.hasOwn(storageData, "storedAt")
            ) {
                localStorage.removeItem(this.AUTH_STORAGE_KEY);
                return undefined;
            }

            // In json-server-auth, il token scade dopo un'ora (3600 secondi)
            const oneHourInMs = 3600 * 1000;
            const hasExpired = (new Date().getTime() - storageData.storedAt) > oneHourInMs;

            if (hasExpired) {
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

    public static getStoredAt(): number | undefined {
        return this.getAuthData()?.storedAt;
    }

    public static setAuthData(data: AuthStorageData): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.AUTH_STORAGE_KEY, JSON.stringify(data));
            // Salva il token in un cookie per l'accesso al middleware
            document.cookie = `token=${data.accessToken}; path=/; max-age=3600; SameSite=Lax`;
        }
    }

    public static removeAuthData(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.AUTH_STORAGE_KEY);
            // Rimuovi il cookie
            document.cookie = `token=; path=/; max-age=0; SameSite=Lax`;
        }
    }

    public static hasToken(): boolean {
        return !!this.getToken();
    }

    public static hasTokenExpired(): boolean {
        const timeStored = this.getStoredAt();

        if (timeStored === undefined) {
            return true;
        }

        const oneHourInMs = 3600 * 1000;
        return (new Date().getTime() - timeStored) > oneHourInMs;
    }
}