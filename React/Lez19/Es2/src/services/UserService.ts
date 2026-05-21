import jsonData from '../resources/users.json';
import type { User, UsersCache } from "../types/User.ts";
import { sleep } from '../helpers/Sleep.ts';

export abstract class UserService {
    private static CACHE_KEY: string = 'app_users';
    private static CACHE_TTL_MS: number = 2 * 60 * 1000; // 2 minuti di cache

    private static async runSimulations(): Promise<User[] | string> {
        // Simula il caricamento
        await sleep(1000 + Math.random() * 2000);

        // Simula l'errore (5% probabilità)
        const isError: boolean = Math.random() < 0.05;
        if (isError)
            throw new Error("Errore nel caricamento dei dati");

        // Simula lista vuota (5% probabilità)
        const isEmpty: boolean = Math.random() < 0.05;
        if (isEmpty) {
            return [];
        } else {
            return "Success";
        }
    }

    public static async loadUsers(simulateCalls: boolean): Promise<User[]> {
        if (simulateCalls) {
            try {
                const testResult: User[] | string = await this.runSimulations();

                if (testResult && typeof testResult === 'object'
                    && Array.isArray(testResult) && testResult.length === 0
                ) {
                    return [];
                } else if (testResult && typeof testResult === 'string' && testResult === 'Success') {
                    console.log("--- SIMULAZIONI ESEGUITE CON SUCCESSO ---");
                } else {
                    throw new Error("Errore nella finalizzazione delle simulazioni");
                }
            } catch (error) {
                console.error("Errore nell'esecuzione delle simulazioni");
                throw error;
            }
        }

        // Controlla se la cache non è scaduta e i dati sono ancora presenti
        const storedUsers: string | null = localStorage.getItem(this.CACHE_KEY);

        if (storedUsers) {
            try {
                const cache = JSON.parse(storedUsers) as UsersCache;

                // Se la cache è scaduta, allora crea una nuova cache con la lista utenti completa
                if (this.isCacheExpired()) {
                    const resetCache: UsersCache = {
                        data: jsonData,
                        expiry: new Date().getTime() + this.CACHE_TTL_MS
                    };

                    localStorage.setItem(this.CACHE_KEY, JSON.stringify(resetCache));
                    return resetCache.data;
                } else {
                    // Altrimenti, restituisci i dati della cache
                    return cache.data;
                }
            } catch (error) {
                console.error("Errore nel parsing dei task da LocalStorage, ricarico il JSON di default:", error);
                return jsonData;
            }
        }

        // Al primo avvio (o se il storage era vuoto/corrotto):
        // Crea una cache con il JSON iniziale
        this.saveUsers(jsonData);

        // Restituisci la cache iniziale
        return jsonData;
    }

    public static isCacheExpired(): boolean {
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

    public static saveUsers(users: User[]): void {
        const now = new Date();

        const cache: UsersCache = {
            data: users,
            expiry: now.getTime() + this.CACHE_TTL_MS
        }

        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
    }

    public static async deleteUser(givenUser: User): Promise<void> {
        const users = await this.loadUsers(false);
        const usersWithout: User[] = users.filter(user => user.id != givenUser.id);

        this.saveUsers(usersWithout);
    }
}