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
                console.error(error instanceof Error ? error.message : 'Errore sconosciuto');
                throw error;
            }
        }

        let _page: string = '';
        let _limit: string = '';
        let _role: string = '';

        if (request.page) _page = `_page=${request.page}&`;
        if (request.limit) _limit = `_limit=${request.limit}&`;
        if (request.filter) {
            switch (request.filter) {
                case "":
                    _role = '';
                    break;
                case "reader":
                    _role = `role=reader`;
                    break;
                case "editor":
                    _role = `role=editor`;
                    break;
                case "admin":
                    _role = `role=admin`;
                    break;
                default:
                    break;
            }
        }

        const response = await apiService.getFullResponse<User[]>(`${BASE_ENDPOINT}?${_page}${_limit}${_role}`);
        const totalCountHeader = response.headers['x-total-count'];
        const items = totalCountHeader ? parseInt(totalCountHeader, 10) : 0;

        const limit = request.limit || 10;
        const page = request.page || 1;
        const pages = Math.ceil(items / limit);

        const hasFilter = !!request.filter;
        const data = (items === 0 && hasFilter) ? null : response.data;

        return {
            first: 1,
            prev: page > 1 ? page - 1 : null,
            next: page < pages ? page + 1 : null,
            last: pages || 1,
            pages: pages,
            items: items,
            data: data
        };
    }

    public async createUser(request: SaveUserRequest): Promise<User> {
        return await apiService.post(BASE_ENDPOINT, request);
    }

    public async updateUser(request: SaveUserRequest, method: 'PUT' | 'PATCH'): Promise<User> {
        if (method == 'PUT') return await apiService.put(`${BASE_ENDPOINT}/${request.id}`, request);
        return await apiService.patch(`${BASE_ENDPOINT}/${request.id}`, request);
    }

    public async deleteUser(user: User): Promise<void> {
        return await apiService.delete(`${BASE_ENDPOINT}/${user.id}`);
    }
}

export const userService = new UserService();
