"use server";

import { taskService } from "@/app/api/task.service";
import { SaveTaskRequest } from "@/models/requests/task-requests";
import { revalidatePath, revalidateTag } from "next/cache";
import { ActionState } from "@/models/types/ActionState";

export async function createTaskAction(prevState: ActionState, request: SaveTaskRequest): Promise<ActionState> {
    let taskId = "";
    try {
        const createdTask = await taskService.createTask(request);
        taskId = createdTask.id;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante il salvataggio dell'attività."
        };
    }

    revalidatePath("/dashboard/tasks");
    revalidateTag('tasks-list-tag', 'default');
    return { success: true, redirectUrl: `/dashboard/tasks/${taskId}`, message: "Attività creata con successo." };
}

export async function updateTaskAction(prevState: ActionState, request: SaveTaskRequest): Promise<ActionState> {
    let taskId = request.id;
    try {
        const updatedTask = await taskService.updateTask(request, "PATCH");
        taskId = updatedTask.id;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'aggiornamento dell'attività."
        };
    }

    revalidatePath("/dashboard/tasks");
    revalidateTag('tasks-list-tag', 'default');
    revalidateTag(`task-${taskId}`, 'default');
    return { success: true, redirectUrl: `/dashboard/tasks/${taskId}`, message: "Attività modificata con successo." };
}

export async function deleteTaskAction(id: string | number): Promise<{ success: boolean; message: string }> {
    try {
        await taskService.deleteTask(id);
        revalidatePath("/dashboard/tasks");
        revalidateTag('tasks-list-tag', 'default');
        revalidateTag(`task-${id}`, 'default');
        return { success: true, message: "Attività eliminata con successo." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'eliminazione dell'attività."
        };
    }
}
