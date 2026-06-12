import { Task } from "../types/Task";

export interface GetFPTasksResponse {
    first: number;
    prev: number | null;
    next: number | null;
    last: number;
    pages: number;
    items: number;
    data: Task[] | null;
}
