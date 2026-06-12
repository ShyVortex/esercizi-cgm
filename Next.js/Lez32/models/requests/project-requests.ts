export interface GetFPProjectsRequest {
    page?: number;
    limit?: number;
    filter?: string;
    isActive?: string;
}

export interface SaveProjectRequest {
    id?: string;
    title: string;
    description: string;
    stateId: string;
    isActive: boolean;
}