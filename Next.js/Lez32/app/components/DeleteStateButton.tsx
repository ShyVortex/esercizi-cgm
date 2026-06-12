"use client";

import React from "react";
import Swal from "sweetalert2";
import { deleteStateAction } from "../actions/state.actions";

type Props = {
    stateId: string | number;
    stateName: string;
}

export default function DeleteStateButton({ stateId, stateName }: Props) {
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: "Sei sicuro?",
            text: `Stai per eliminare lo stato "${stateName}". L'operazione non è reversibile!`,
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
                const response = await deleteStateAction(stateId);
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

    return (
        <button
            className="p-2 text-xs bg-red-600 hover:bg-red-500 text-white font-medium rounded cursor-pointer transition-colors duration-150 inline-flex items-center justify-center h-[32px]"
            onClick={handleDelete}
        >
            Elimina
        </button>
    );
}
