import { sleep } from '../helpers/sleep';
import { apiService } from './api.service';
import { GetFPProjectsRequest, SaveProjectRequest } from '@/models/requests/project-requests';
import { GetFPProjectsResponse } from '@/models/responses/project-responses';
import { Project } from '@/models/types/Project';

const BASE_ENDPOINT: string = '/projects';

import { unstable_cache } from 'next/cache';

export class ProjectService {
    public emptyResponse: GetFPProjectsResponse = {
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

    public getCachedFilteredProjects = (simulate: boolean, request: GetFPProjectsRequest, token?: string) => {
        return unstable_cache(
            async () => {
                return await this.getFilteredPaginatedProjects(simulate, request, token);
            },
            ['projects-list', request.page?.toString() || '1', request.limit?.toString() || '10', request.filter || '', request.isActive || ''],
            {
                tags: ['projects-list-tag'],
                revalidate: 3600
            }
        )();
    };

    public async getFilteredPaginatedProjects(simulateCalls: boolean, request: GetFPProjectsRequest, token?: string): Promise<GetFPProjectsResponse | undefined> {
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
        if (request.filter) _search = `title_like=${request.filter}&`;

        // Utilizziamo _expand=state e _embed=tasks per popolare le relazioni
        const response = await apiService.getFullResponse<Project[]>(
            `${BASE_ENDPOINT}?${_page}${_limit}${_search}${_active}_expand=state&_embed=tasks`,
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

    public getCachedProjectDetail = (projectId: string, simulate: boolean = false, token?: string) => {
        return unstable_cache(
            async () => {
                return await this.getProject(projectId, simulate, token);
            },
            ['project-detail', projectId],
            {
                tags: [`project-${projectId}`, 'projects-list-tag'],
                revalidate: 3600
            }
        )();
    };

    public async getProject(id: string, simulate: boolean = false, token?: string): Promise<Project | undefined> {
        if (simulate) {
            await this.runSimulations();
        }

        try {
            return await apiService.get(`${BASE_ENDPOINT}/${id}?_expand=state&_embed=tasks`, token ? { Authorization: `Bearer ${token}` } : undefined);
        } catch (error) {
            if (error instanceof Error) console.error(error.message);
            throw error;
        }
    }

    public async createProject(request: SaveProjectRequest): Promise<Project> {
        return await apiService.post(BASE_ENDPOINT, request);
    }

    public async updateProject(request: SaveProjectRequest, method: 'PUT' | 'PATCH'): Promise<Project> {
        if (method == 'PUT') return await apiService.put(`${BASE_ENDPOINT}/${request.id}`, request);
        return await apiService.patch(`${BASE_ENDPOINT}/${request.id}`, request);
    }

    public async deleteProject(id: string | number): Promise<void> {
        return await apiService.delete(`${BASE_ENDPOINT}/${id}`);
    }
}

export const projectService = new ProjectService();
