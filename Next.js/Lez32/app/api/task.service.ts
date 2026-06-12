import { sleep } from '../helpers/sleep';
import { apiService } from './api.service';
import { GetFPTasksRequest, SaveTaskRequest } from '@/models/requests/task-requests';
import { GetFPTasksResponse } from '@/models/responses/task-responses';
import { Task } from '@/models/types/Task';

const BASE_ENDPOINT: string = '/tasks';

import { unstable_cache } from 'next/cache';

export class TaskService {
    public emptyResponse: GetFPTasksResponse = {
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
    public getCachedFilteredTasks = (simulate: boolean, request: GetFPTasksRequest, token?: string) => {
        return unstable_cache(
            async () => {
                return await this.getFilteredPaginatedTasks(simulate, request, token);
            },

            // Chiave unica della cache basata sui filtri applicati
            ['tasks-list', request.page?.toString() || '1', request.limit?.toString() || '10', request.filter || '', request.isActive || ''],
            {
                tags: ['tasks-list-tag'], // Tag usato per la revalidazione
                revalidate: 3600          // Tempo di persistenza in secondi
            }
        )();
    };

    public async getFilteredPaginatedTasks(simulateCalls: boolean, request: GetFPTasksRequest, token?: string): Promise<GetFPTasksResponse | undefined> {
        if (simulateCalls) {
            await this.runSimulations();
        }

        let _page: string = '';
        let _limit: string = '';
        let _state: string = '';

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
        if (request.filter) _state = `stateId=${request.filter}&`;

        const response = await apiService.getFullResponse<Task[]>(
            `${BASE_ENDPOINT}?${_page}${_limit}${_state}${_active}_expand=state`,
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

    // Creiamo una versione cacheata per il dettaglio del singolo task
    public getCachedTaskDetail = (taskId: string, simulate: boolean = false, token?: string) => {
        return unstable_cache(
            async () => {
                return await this.getTask(taskId, simulate, token);
            },
            ['task-detail', taskId],
            {
                tags: [`task-${taskId}`, 'tasks-list-tag'],
                revalidate: 3600
            }
        )();
    };

    public async getTask(id: string, simulate: boolean = false, token?: string): Promise<Task | undefined> {
        if (simulate) {
            await this.runSimulations();
        }

        try {
            return await apiService.get(`${BASE_ENDPOINT}/${id}?_expand=state`, token ? { Authorization: `Bearer ${token}` } : undefined);
        } catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            } else {
                console.error("Si è verificato un errore");
            }
            throw error;
        }
    }

    public async createTask(request: SaveTaskRequest): Promise<Task> {
        return await apiService.post(BASE_ENDPOINT, request);
    }

    public async updateTask(request: SaveTaskRequest, method: 'PUT' | 'PATCH'): Promise<Task> {
        if (method == 'PUT') return await apiService.put(`${BASE_ENDPOINT}/${request.id}`, request);
        return await apiService.patch(`${BASE_ENDPOINT}/${request.id}`, request);
    }

    public async deleteTask(id: string | number): Promise<void> {
        return await apiService.delete(`${BASE_ENDPOINT}/${id}`);
    }
}

export const taskService = new TaskService();
