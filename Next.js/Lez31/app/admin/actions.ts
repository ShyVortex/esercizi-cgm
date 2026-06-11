"use server";

import { userService } from "@/app/api/user.service";
import { SaveUserRequest } from "@/models/requests/user-requests";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { ActionState } from "@/models/types/ActionState";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function createUserAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const roleSelect = formData.get("role") as string;

    const errors: { [key: string]: string } = {};

    if (!username || username.trim().length < 3) {
        errors.username = "Username obbligatorio (minimo 3 caratteri).";
    }
    if (!email || !email.includes("@")) {
        errors.email = "Email non valida.";
    }
    if (!password || password.length < 6) {
        errors.password = "Password obbligatoria (minimo 6 caratteri).";
    }
    if (!firstName || firstName.trim().length < 2) {
        errors.firstName = "Nome obbligatorio (minimo 2 caratteri).";
    }
    if (!lastName || lastName.trim().length < 2) {
        errors.lastName = "Cognome obbligatorio (minimo 2 caratteri).";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors, message: "Errore di validazione dei campi." };
    }

    let newUser;
    try {
        const userData: SaveUserRequest = {
            username: username.trim(),
            email: email.trim(),
            password: password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            middleName: middleName?.trim() || undefined,
            role: roleSelect ? Number(roleSelect) : 1,
            isActive: true, // Nuovi utenti sono attivi di default
        };
        const result = await userService.createUser(userData) as any;
        // json-server-auth POST /users restituisce { accessToken, user }
        newUser = result.user ? result.user : result;
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante il salvataggio dell'utente."
        };
    }

    revalidatePath("/admin");
    revalidateTag('users-list-tag', 'default');
    redirect(`/admin/${newUser.id}`);
}

export async function updateUserAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
    const id = formData.get("userId") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const middleName = formData.get("middleName") as string;
    const roleSelect = formData.get("role") as string;

    const errors: { [key: string]: string } = {};

    if (!username || username.trim().length < 3) {
        errors.username = "Username obbligatorio (minimo 3 caratteri).";
    }
    if (!email || !email.includes("@")) {
        errors.email = "Email non valida.";
    }
    if (password && password.trim() !== "" && password.length < 6) {
        errors.password = "La password deve contenere almeno 6 caratteri.";
    }
    if (!firstName || firstName.trim().length < 2) {
        errors.firstName = "Nome obbligatorio (minimo 2 caratteri).";
    }
    if (!lastName || lastName.trim().length < 2) {
        errors.lastName = "Cognome obbligatorio (minimo 2 caratteri).";
    }

    if (Object.keys(errors).length > 0) {
        return { success: false, errors, message: "Errore di validazione dei campi." };
    }

    let updated;
    try {
        const userData: SaveUserRequest = {
            id: id,
            username: username.trim(),
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            middleName: middleName?.trim() || undefined,
        };

        if (password && password.trim() !== "") {
            userData.password = password;
        }
        if (roleSelect) {
            userData.role = Number(roleSelect);
        }

        updated = await userService.updateUser(userData, "PATCH");
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante il salvataggio dell'utente."
        };
    }

    revalidatePath("/admin");
    revalidateTag('users-list-tag', 'default');
    revalidateTag(`user-${updated.id}`, 'default');
    redirect(`/admin/${updated.id}`);
}

export async function deleteUserAction(userId: string | number): Promise<{ success: boolean; message: string }> {
    try {
        await userService.deleteUser(userId);
        revalidatePath("/admin");
        revalidateTag('users-list-tag', 'default');
        revalidateTag(`user-${userId}`, 'default');
        return { success: true, message: "Utente eliminato con successo." };
    } catch (error) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Errore durante l'eliminazione dell'utente."
        };
    }
}
