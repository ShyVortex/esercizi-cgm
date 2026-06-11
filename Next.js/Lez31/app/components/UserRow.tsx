"use client";

import type React from "react";
import type { User } from "@/models/types/User";
import { useRouter } from "next/navigation";
import { AuthStorageService } from "../services/auth-storage.service";
import { deleteUserAction } from "../admin/actions";
import Swal from "sweetalert2";

type Props = {
    user: User;
}

export default function UserRow({ user }: Props): React.ReactElement {
    const router = useRouter();
    const loggedUser = AuthStorageService.getUser();

    const activeText: string = user.isActive ? 'Attivo' : 'Inattivo';
    const activeClass: string = user.isActive
        ? "p-4 text-sm text-green-400 font-medium"
        : "p-4 text-sm text-red-400 font-medium";

    const btnEditStyle: string = "p-2 w-20 text-sm bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer";
    const btnDeleteStyle: string = "p-2 w-20 text-sm bg-red-600 hover:bg-red-500 text-white font-medium rounded cursor-pointer transition-colors duration-150";

    const handleRowClick = () => {
        router.push(`/admin/${user.id}`);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/admin?modal=edit&editUserId=${user.id}`);
    };

    const handleDeleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: "Sei sicuro?",
            text: `Stai per eliminare l'utente ${user.firstName} ${user.lastName}. L'operazione non è reversibile!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sì, eliminalo!",
            cancelButtonText: "Annulla",
            background: "#1f2937",
            color: "#fff"
        });

        if (result.isConfirmed) {
            try {
                const response = await deleteUserAction(user.id);
                if (response.success) {
                    Swal.fire({
                        title: "Eliminato!",
                        text: response.message,
                        icon: "success",
                        background: "#1f2937",
                        color: "#fff",
                        timer: 2000,
                        showConfirmButton: false
                    });
                } else {
                    Swal.fire({
                        title: "Errore!",
                        text: response.message,
                        icon: "error",
                        background: "#1f2937",
                        color: "#fff"
                    });
                }
            } catch (err) {
                Swal.fire({
                    title: "Errore!",
                    text: err instanceof Error ? err.message : "Si è verificato un errore.",
                    icon: "error",
                    background: "#1f2937",
                    color: "#fff"
                });
            }
        }
    };

    let roleText: string;
    switch (user.role) {
        case 1:
            roleText = "Utente";
            break;
        case 2:
            roleText = "Amministratore";
            break;
        default:
            roleText = '';
            break;
    }

    return (
        <tr
            onClick={handleRowClick}
            className="border-b border-gray-700 hover:bg-gray-700/30 cursor-pointer transition-colors duration-150"
        >
            <td className="p-4 text-sm text-gray-300">{user.id}</td>
            <td className="p-4 text-sm text-gray-300">{user.username}</td>
            <td className="p-4 text-sm text-gray-300">{user.email}</td>
            <td className="p-4 text-sm text-gray-300">{roleText}</td>
            <td className={activeClass}>{activeText}</td>
            <td className="p-4 text-right space-x-2">
                {loggedUser?.role === 2 && (
                    <>
                        <button
                            className={btnEditStyle}
                            onClick={handleEditClick}
                        >
                            Modifica
                        </button>
                        {loggedUser.id !== user.id && (
                            <button
                                className={btnDeleteStyle}
                                onClick={handleDeleteClick}
                            >
                                Elimina
                            </button>
                        )}
                    </>
                )}
            </td>
        </tr>
    );
}
