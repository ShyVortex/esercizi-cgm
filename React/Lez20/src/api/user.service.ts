import type { User } from "../models/types/User.ts";
import { sleep } from '../helpers/sleep.ts';
import { apiService } from './api.service.ts';
import type { SaveUserRequest } from "../models/requests/user-requests.ts";

const BASE_ENDPOINT: string = '/users';

export class UserService {
    private async runSimulations(): Promise<User[] | string> {
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

    public async getUsers(simulateCalls: boolean): Promise<User[]> {
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

        return await apiService.get(BASE_ENDPOINT) as User[];
    }

    public async createUser(request: SaveUserRequest): Promise<User> {
        return await apiService.post(BASE_ENDPOINT, request);
    }

    public async updateUser(request: SaveUserRequest, method: 'PUT' | 'PATCH'): Promise<User> {
        if (method == 'PUT') return await apiService.put(`${BASE_ENDPOINT}/${request.id}`, request);
        else if (method == 'PATCH') return await apiService.patch(`${BASE_ENDPOINT}/${request.id}`, request)
    }

    public async deleteUser(user: User): Promise<void> {
        return await apiService.delete(`${BASE_ENDPOINT}/${user.id}`);
    }
}

export const userService = new UserService();
