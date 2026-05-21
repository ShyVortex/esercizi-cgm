import type { UsersCache } from "../types/User";

export function isCacheExpired(): boolean {
    const storedUsers: string | null = localStorage.getItem(this.CACHE_KEY);
    if (!storedUsers) return true;

    try {
        const cache = JSON.parse(storedUsers) as UsersCache;
        const now = new Date().getTime();
        return now > cache.expiry;
    } catch {
        return true;
    }
}