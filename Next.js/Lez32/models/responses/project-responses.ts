import { Project } from "../types/Project";

export interface GetFPProjectsResponse {
    first: number;
    prev: number | null;
    next: number | null;
    last: number;
    pages: number;
    items: number;
    data: Project[] | null;
}
