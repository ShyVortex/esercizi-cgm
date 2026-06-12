"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import DataTable, { Column } from "./DataTable";
import { User } from "@/models/types/User";
import { AuthStorageService } from "../services/auth-storage.service";
import { deleteUserAction } from "../actions/user.actions";

type Props = {
    users: User[];
}

export default function UserList({ users }: Props): React.ReactElement {
    const router = useRouter();
    const loggedUser = AuthStorageService.getUser();

    const handleEditClick = (e: React.MouseEvent, user: User) => {
        e.stopPropagation();
        router.push(`/dashboard/users?modal=edit&editUserId=${user.id}`);
    };

    const handleDeleteClick = async (e: React.MouseEvent, user: User) => {
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

    // Definiamo le colonne per la tabella degli utenti
    const columns: Column<User>[] = [
        {
            key: "id",
            label: "User ID",
            render: (user) => (
                <span className="text-blue-400 hover:underline font-medium">
                    {user.id}
                </span>
            )
        },
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        {
            key: "role",
            label: "Ruolo",
            render: (user) => {
                switch (user.role) {
                    case 1:
                        return "Utente";
                    case 2:
                        return "Manager";
                    case 3:
                        return "Amministratore";
                    default:
                        return "Sconosciuto";
                }
            }
        },
        {
            key: "isActive",
            label: "Stato",
            render: (user) => (
                <span className={user.isActive ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {user.isActive ? "Attivo" : "Inattivo"}
                </span>
            )
        },
        {
            key: "actions",
            label: "Azioni",
            headerClassName: "text-right",
            cellClassName: "text-right p-4",
            render: (user) => {
                // Solo l'amministratore (ruolo 3) o il proprietario delle azioni può modificare/eliminare
                const isAdmin = loggedUser?.role === 3;
                if (!isAdmin) return null;

                return (
                    <div className="flex justify-end items-center gap-2 whitespace-nowrap">
                        <button
                            className="p-2 w-20 text-xs bg-gray-600 hover:bg-gray-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 inline-flex items-center justify-center h-[32px]"
                            onClick={(e) => handleEditClick(e, user)}
                        >
                            Modifica
                        </button>
                        {loggedUser?.id !== user.id && (
                            <button
                                className="p-2 w-20 text-xs bg-red-600 hover:bg-red-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 inline-flex items-center justify-center h-[32px]"
                                onClick={(e) => handleDeleteClick(e, user)}
                            >
                                Elimina
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={users}
            rowKey={(user) => user.id}
            getRowUrl={(user) => `/dashboard/users/${user.id}`}
        />
    );
}