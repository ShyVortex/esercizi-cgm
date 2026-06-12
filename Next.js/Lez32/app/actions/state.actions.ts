"use server";

import { stateService } from "@/app/api/state.service";
import { SaveStateRequest } from "@/models/requests/state-requests";
import { revalidatePath, revalidateTag } from "next/cache";
import { ActionState } from "@/models/types/ActionState";

export async function createStateAction(prevState: ActionState, request: SaveStateRequest): Promise<ActionState> {
    let newStateId = "";
    try {
        const created = await stateService.createState(request);
        newStateId = created.id;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante il salvataggio dello stato."
        };
    }

    revalidatePath("/dashboard/states");
    revalidateTag('states-list-tag', 'default');
    return { success: true, redirectUrl: `/dashboard/states/${newStateId}`, message: "Stato creato con successo." };
}

export async function updateStateAction(prevState: ActionState, request: SaveStateRequest): Promise<ActionState> {
    let stateId = request.id;
    try {
        const updatedState = await stateService.updateState(request, "PATCH");
        stateId = updatedState.id;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'aggiornamento dello stato."
        };
    }

    revalidatePath("/dashboard/states");
    revalidateTag('states-list-tag', 'default');
    revalidateTag(`state-${stateId}`, 'default');
    return { success: true, redirectUrl: `/dashboard/states/${stateId}`, message: "Stato modificato con successo." };
}

export async function deleteStateAction(id: string | number): Promise<{ success: boolean; message: string }> {
    try {
        await stateService.deleteState(id);
        revalidatePath("/dashboard/states");
        revalidateTag('states-list-tag', 'default');
        revalidateTag(`state-${id}`, 'default');
        return { success: true, message: "Stato eliminato con successo." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'eliminazione dello stato."
        };
    }
}
