import type { User } from "../models/types/User.ts";
import { sleep } from '../helpers/sleep.ts';
import { apiService } from './api.service.ts';
import type { GetFPUsersRequest, SaveUserRequest } from "../models/requests/user-requests.ts";
import type { GetFPUsersResponse } from "../models/responses/user-responses.ts";

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

    private async runSimulations(): Promise<GetFPUsersResponse | string> {
        // Simula il caricamento
        await sleep(1000 + Math.random() * 2000);

        // Simula l'errore (5% probabilità)
        const isError: boolean = Math.random() < 0.05;
        if (isError)
            throw new Error("Errore nel caricamento dei dati");

        // Simula lista vuota (5% probabilità)
        const isEmpty: boolean = Math.random() < 0.05;
        if (isEmpty) {
            return this.emptyResponse;
        } else {
            return "Success";
        }
    }

    public async getFilteredPaginatedUsers(simulateCalls: boolean, request: GetFPUsersRequest): Promise<GetFPUsersResponse> {
        if (simulateCalls) {
            try {
                const testResult: GetFPUsersResponse | string = await this.runSimulations();

                if (testResult && typeof testResult === 'object'
                    && testResult === this.emptyResponse
                ) {
                    return this.emptyResponse;
                } else if (testResult && typeof testResult === 'string' && testResult === 'Success') {
                    console.log("--- SIMULAZIONI ESEGUITE CON SUCCESSO ---");
                } else {
                    throw new Error("Errore nella finalizzazione delle simulazioni");
                }
            } catch (error) {
                console.error(error.message);
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
