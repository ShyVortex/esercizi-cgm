export interface GetFPTasksRequest {
    page?: number;
    limit?: number;
    filter?: string;
    isActive?: string;
}

export interface SaveTaskRequest {
    id?: string;
    title: string;
    description: string;
    assignedTo: string; // userId
    start: Date;
    end: Date;
    stateId: string;
    estimatedLength: number;
    effectiveLength: number;
    projectId: string;
    isActive: boolean;
}