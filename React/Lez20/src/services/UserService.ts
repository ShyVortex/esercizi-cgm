import jsonData from '../resources/db.json';
import type { User } from "../types/User.ts";
import { sleep } from '../helpers/sleep.ts';

export abstract class UserService {
    private static CACHE_KEY: string = 'app_users';

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

        const storedUsers: string | null = localStorage.getItem(this.CACHE_KEY);

        if (storedUsers) {
            try {
                return JSON.parse(storedUsers) as User[];
            } catch (error) {
                console.error("Errore nel parsing dei task da LocalStorage, ricarico il JSON di default:", error);
                return jsonData.users;
            }
        }

        // Al primo avvio (o se il storage era vuoto/corrotto):
        // Crea una cache con il JSON iniziale
        this.saveUsers(jsonData.users);

        // Restituisci la cache iniziale
        return jsonData.users;
    }

    public static saveUsers(users: User[]): void {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(users));
    }

    public static async deleteUser(givenUser: User): Promise<void> {
        const users = await this.loadUsers(false);
        const usersWithout: User[] = users.filter(user => user.id != givenUser.id);

        this.saveUsers(usersWithout);
    }
}