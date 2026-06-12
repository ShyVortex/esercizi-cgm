import { sleep } from '../helpers/sleep';
import { apiService } from './api.service';
import { GetFPUsersRequest, SaveUserRequest } from '@/models/requests/user-requests';
import { GetFPUsersResponse } from '@/models/responses/user-responses';
import { User } from '@/models/types/User';

const BASE_ENDPOINT: string = '/users';

import { unstable_cache } from 'next/cache';

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

    public async runSimulations(): Promise<string> {
        // Simula il caricamento
        await sleep(1000 + Math.random() * 2000);

        // Simula l'errore (5% probabilità)
        const isError: boolean = Math.random() < 0.05;
        if (isError)
            throw new Error("Errore nel caricamento dei dati");

        // Simula not found (5% probabilità)
        const isNotFound: boolean = Math.random() < 0.05;
        if (isNotFound) {
            throw new Error("SIMULATED_NOT_FOUND");
        }
        return "Success";
    }

    // Creiamo una versione cacheata per recuperare la lista filtrata
    public getCachedFilteredUsers = (simulate: boolean, request: GetFPUsersRequest, token?: string) => {
        return unstable_cache(
            async () => {
                return await userService.getFilteredPaginatedUsers(simulate, request, token);
            },

            // Chiave unica della cache basata sui filtri applicati
            ['users-list', request.page?.toString() || '1', request.limit?.toString() || '10', request.filter || '', request.isActive || ''],
            {
                tags: ['users-list-tag'], // Tag usato per la revalidazione
                revalidate: 3600          // Tempo di persistenza in secondi
            }
        )();
    };

    public async getFilteredPaginatedUsers(simulateCalls: boolean, request: GetFPUsersRequest, token?: string): Promise<GetFPUsersResponse | undefined> {
        if (simulateCalls) {
            await this.runSimulations();
        }

        let _page: string = '';
        let _limit: string = '';
        let _role: string = '';

        let _active: string = '';
        if (request.isActive) {
            if (request.isActive === 'active') {
                _active = 'isActive=true&';
            } else if (request.isActive === 'inactive') {
                _active = 'isActive=false&';
            }
        }

        if (request.page) _page = `_page=${request.page}&`;
        if (request.limit) _limit = `_limit=${request.limit}&`;
        if (request.filter) {
            switch (request.filter) {
                case "":
                    _role = '';
                    break;
                case "user":
                    _role = `role=1&`;
                    break;
                case "admin":
                    _role = `role=2&`;
                    break;
                default:
                    break;
            }
        }

        const response = await apiService.getFullResponse<User[]>(
            `${BASE_ENDPOINT}?${_page}${_limit}${_role}${_active}`,
            token ? { Authorization: `Bearer ${token}` } : undefined
        );
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

    // Creiamo una versione cacheata per il dettaglio del singolo utente
    public getCachedUserDetail = (userId: string, simulate: boolean = false, token?: string) => {
        return unstable_cache(
            async () => {
                return await userService.getUser(userId, simulate, token);
            },
            ['user-detail', userId],
            {
                tags: [`user-${userId}`, 'users-list-tag'],
                revalidate: 3600
            }
        )();
    };

    public async getUser(id: string, simulate: boolean = false, token?: string): Promise<User | undefined> {
        if (simulate) {
            await this.runSimulations();
        }

        try {
            return await apiService.get(`${BASE_ENDPOINT}/${id}`, token ? { Authorization: `Bearer ${token}` } : undefined);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("Si è verificato un errore");
            }
            throw error;
        }
    }

    public async createUser(request: SaveUserRequest): Promise<User> {
        return await apiService.post(BASE_ENDPOINT, request);
    }

    public async updateUser(request: SaveUserRequest, method: 'PUT' | 'PATCH'): Promise<User> {
        if (method == 'PUT') return await apiService.put(`${BASE_ENDPOINT}/${request.id}`, request);
        return await apiService.patch(`${BASE_ENDPOINT}/${request.id}`, request);
    }

    public async deleteUser(userId: string | number): Promise<void> {
        return await apiService.delete(`${BASE_ENDPOINT}/${userId}`);
    }
}

export const userService = new UserService();
