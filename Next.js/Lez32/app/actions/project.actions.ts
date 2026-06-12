"use server";

import { projectService } from "@/app/api/project.service";
import { SaveProjectRequest } from "@/models/requests/project-requests";
import { revalidatePath, revalidateTag } from "next/cache";
import { ActionState } from "@/models/types/ActionState";

export async function createProjectAction(prevState: ActionState, request: SaveProjectRequest): Promise<ActionState> {
    let newProjectId = "";
    try {
        const created = await projectService.createProject(request);
        newProjectId = created.id;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante il salvataggio del progetto."
        };
    }

    revalidatePath("/dashboard/projects");
    revalidateTag('projects-list-tag', 'default');
    return { success: true, redirectUrl: `/dashboard/projects/${newProjectId}`, message: "Progetto creato con successo." };
}

export async function updateProjectAction(prevState: ActionState, request: SaveProjectRequest): Promise<ActionState> {
    let projectId = request.id;
    try {
        const updatedProject = await projectService.updateProject(request, "PATCH");
        projectId = updatedProject.id;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'aggiornamento del progetto."
        };
    }

    revalidatePath("/dashboard/projects");
    revalidateTag('projects-list-tag', 'default');
    revalidateTag(`project-${projectId}`, 'default');
    return { success: true, redirectUrl: `/dashboard/projects/${projectId}`, message: "Progetto modificato con successo." };
}

export async function deleteProjectAction(id: string | number): Promise<{ success: boolean; message: string }> {
    try {
        await projectService.deleteProject(id);
        revalidatePath("/dashboard/projects");
        revalidateTag('projects-list-tag', 'default');
        revalidateTag(`project-${id}`, 'default');
        return { success: true, message: "Progetto eliminato con successo." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'eliminazione del progetto."
        };
    }
}
