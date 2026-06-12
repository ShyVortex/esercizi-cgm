import { sleep } from '../helpers/sleep';
import { apiService } from './api.service';
import { GetFPStatesRequest, SaveStateRequest } from '@/models/requests/state-requests';
import { GetFPStatesResponse } from '@/models/responses/state-responses';
import { State } from '@/models/types/Task';

const BASE_ENDPOINT: string = '/states';

import { unstable_cache } from 'next/cache';

export class StateService {
    public emptyResponse: GetFPStatesResponse = {
        first: 0,
        prev: null,
        next: null,
        last: 0,
        pages: 0,
        items: 0,
        data: []
    }

    public async runSimulations(): Promise<string> {
        await sleep(1000 + Math.random() * 2000);

        const isError: boolean = Math.random() < 0.05;
        if (isError)
            throw new Error("Errore nel caricamento dei dati");

        const isNotFound: boolean = Math.random() < 0.05;
        if (isNotFound) {
            throw new Error("SIMULATED_NOT_FOUND");
        }
        return "Success";
    }

    public getCachedFilteredStates = (simulate: boolean, request: GetFPStatesRequest, token?: string) => {
        return unstable_cache(
            async () => {
                return await this.getFilteredPaginatedStates(simulate, request, token);
            },
            ['states-list', request.page?.toString() || '1', request.limit?.toString() || '10', request.filter || '', request.isActive || ''],
            {
                tags: ['states-list-tag'],
                revalidate: 3600
            }
        )();
    };

    public async getFilteredPaginatedStates(simulateCalls: boolean, request: GetFPStatesRequest, token?: string): Promise<GetFPStatesResponse | undefined> {
        if (simulateCalls) {
            await this.runSimulations();
        }

        let _page: string = '';
        let _limit: string = '';
        let _search: string = '';
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
        if (request.filter) _search = `name_like=${request.filter}&`;

        const response = await apiService.getFullResponse<State[]>(
            `${BASE_ENDPOINT}?${_page}${_limit}${_search}${_active}`,
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

    public getCachedStateDetail = (stateId: string, simulate: boolean = false, token?: string) => {
        return unstable_cache(
            async () => {
                return await this.getState(stateId, simulate, token);
            },
            ['state-detail', stateId],
            {
                tags: [`state-${stateId}`, 'states-list-tag'],
                revalidate: 3600
            }
        )();
    };

    public async getState(id: string, simulate: boolean = false, token?: string): Promise<State | undefined> {
        if (simulate) {
            await this.runSimulations();
        }

        try {
            return await apiService.get(`${BASE_ENDPOINT}/${id}`, token ? { Authorization: `Bearer ${token}` } : undefined);
        } catch (error) {
            if (error instanceof Error) console.error(error.message);
            throw error;
        }
    }

    public async createState(request: SaveStateRequest): Promise<State> {
        return await apiService.post(BASE_ENDPOINT, request);
    }

    public async updateState(request: SaveStateRequest, method: 'PUT' | 'PATCH'): Promise<State> {
        if (method == 'PUT') return await apiService.put(`${BASE_ENDPOINT}/${request.id}`, request);
        return await apiService.patch(`${BASE_ENDPOINT}/${request.id}`, request);
    }

    public async deleteState(id: string | number): Promise<void> {
        return await apiService.delete(`${BASE_ENDPOINT}/${id}`);
    }
}

export const stateService = new StateService();
