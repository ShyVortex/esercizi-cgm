import { sleep } from '../helpers/sleep';
import { apiService } from './api.service';
import type { GetFPUsersRequest } from "../models/requests/user-requests.ts";
import type { GetFPUsersResponse } from "../models/responses/user-responses.ts";
import { User } from '../models/types/User';

const BASE_ENDPOINT: string = '/users';

export class UserService {
    public emptyResponse: GetFPUsersResponse = {
        first: 0,
        prev: null,
        next: null,
        last: 0,
        pages: 0,
        items: 0,
        data: []
    }

    private async runSimulations(): Promise<GetFPUsersResponse | undefined | string> {
        // Simula il caricamento
        await sleep(1000 + Math.random() * 2000);

        // Simula l'errore (5% probabilità)
        const isError: boolean = Math.random() < 0.05;
        if (isError)
            throw new Error("Errore nel caricamento dei dati");

        // Simula not found (5% probabilità)
        const isNotFound: boolean = Math.random() < 0.05;
        if (isNotFound) {
            return undefined;
        } else {
            return "Success";
        }
    }

    public async getFilteredPaginatedUsers(simulateCalls: boolean, request: GetFPUsersRequest): Promise<GetFPUsersResponse | undefined> {
        if (simulateCalls) {
            try {
                const testResult: GetFPUsersResponse | undefined | string = await this.runSimulations();

                if (!testResult) {
                    return undefined;
                } else if (testResult && typeof testResult === 'string' && testResult === 'Success') {
                    console.log("--- SIMULAZIONI ESEGUITE CON SUCCESSO ---");
                } else {
                    throw new Error("Errore nella finalizzazione delle simulazioni");
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error.message);
                } else {
                    console.error("Si è verificato un errore");
                }
                throw error;
            }
        }

        let _page: string = '';
        let _per_page: string = '';
        let _isActive: string = '';

        if (request.page) _page = `_page=${request.page}&`;
        if (request.per_page) _per_page = `_per_page=${request.per_page}&`;
        if (request.filter) {
            switch (request.filter) {
                case "":
                    _isActive = '';
                    break;
                case "active":
                    _isActive = `isActive=${true}`;
                    break;
                case "inactive":
                    _isActive = `isActive=${false}`;
                    break;
                default:
                    break;
            }
        }

        return await apiService.get(`${BASE_ENDPOINT}?${_page}${_per_page}${_isActive}`);
    }

    public async getUser(id: string): Promise<User> {
        try {
            return await apiService.get(`${BASE_ENDPOINT}/${id}`);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("Si è verificato un errore");
            }
            throw error;
        }
    }
}

export const userService = new UserService();
