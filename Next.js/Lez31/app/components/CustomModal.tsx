"use client";

import Modal from 'react-modal';
import { User } from '@/models/types/User';
import React, { useState, useEffect, useActionState } from 'react';
import { AuthStorageService } from '../services/auth-storage.service';
import { createUserAction, updateUserAction } from '../admin/actions';
import Swal from 'sweetalert2';

// Assicura l'accessibilità del modale
if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
}

export default function CustomModal({ isOpen, onClose, user }: Props) {
    const loggedUser = AuthStorageService.getUser();
    const [showPassword, setShowPassword] = useState(false);

    const actionToRun = user ? updateUserAction : createUserAction;
    const [state, formAction, isPending] = useActionState(actionToRun, {});

    // Gestione risposte Server Actions
    useEffect(() => {
        if (!isOpen) return;

        if (state.success === true) {
            Swal.fire({
                title: "Successo!",
                text: state.message || "Operazione completata con successo.",
                icon: "success",
                background: "#1f2937",
                color: "#fff",
                timer: 2000,
                showConfirmButton: false
            });
            onClose();
        } else if (state.success === false && state.message) {
            Swal.fire({
                title: "Errore!",
                text: state.message,
                icon: "error",
                background: "#1f2937",
                color: "#fff"
            });
        }
    }, [state, isOpen, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel={user ? "Modifica Utente" : "Crea Nuovo Utente"}
            overlayClassName="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
            className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
            {/* Header del Modale */}
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30">
                <h2 className="text-lg font-semibold text-white m-0">
                    {user ? 'Modifica Utente' : 'Crea Nuovo Utente'}
                </h2>
                <button
                    onClick={onClose}
                    disabled={isPending}
                    className="text-gray-400 hover:text-white text-2xl font-bold cursor-pointer transition-colors duration-150 leading-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    &times;
                </button>
            </div>

            {/* Form Interno */}
            <form
                key={user ? `edit-${user.id}` : 'create'}
                action={formAction}
                className="p-6 space-y-4 text-left"
            >
                {/* ID nascosto in caso di modifica */}
                {user && (
                    <input type="hidden" name="userId" value={user.id} />
                )}

                {/* Username */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                    <input
                        type="text"
                        name="username"
                        disabled={isPending}
                        defaultValue={user?.username || ''}
                        placeholder="es. m.rossi"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {state.errors?.username && (
                        <span className="text-red-500 text-xs mt-1">{state.errors.username}</span>
                    )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <input
                        type="email"
                        name="email"
                        disabled={isPending}
                        defaultValue={user?.email || ''}
                        placeholder="es. marco.rossi@example.com"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {state.errors?.email && (
                        <span className="text-red-500 text-xs mt-1">{state.errors.email}</span>
                    )}
                </div>

                {/* Password (visibile solo se l'utente loggato è amministratore) */}
                {loggedUser?.role === 2 && (
                    <div className="flex flex-col gap-1">
                        <label htmlFor='password' className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                disabled={isPending}
                                placeholder="••••••••"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isPending}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {showPassword ? (
                                    <svg className="h-5 w-5 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.815 7.815L21 21m-3.956-3.956l-3.09-3.09m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 animate-fade-in" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        {state.errors?.password && (
                            <span className="text-red-500 text-xs mt-1">{state.errors.password}</span>
                        )}
                    </div>
                )}

                {/* Grid per Nome e Cognome */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                        <input
                            type="text"
                            name="firstName"
                            disabled={isPending}
                            defaultValue={user?.firstName || ''}
                            placeholder="Marco"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {state.errors?.firstName && (
                            <span className="text-red-500 text-xs mt-1">{state.errors.firstName}</span>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cognome</label>
                        <input
                            type="text"
                            name="lastName"
                            disabled={isPending}
                            defaultValue={user?.lastName || ''}
                            placeholder="Rossi"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {state.errors?.lastName && (
                            <span className="text-red-500 text-xs mt-1">{state.errors.lastName}</span>
                        )}
                    </div>
                </div>

                {/* Secondo Nome (Facoltativo) */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        Secondo Nome <span className="text-gray-500 text-[10px] font-normal lowercase">(facoltativo)</span>
                    </label>
                    <input
                        type="text"
                        name="middleName"
                        disabled={isPending}
                        defaultValue={user?.middleName ? user.middleName : ''}
                        placeholder="es. Luigi"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                {/* Ruolo (visibile solo se l'utente loggato è admin e l'utente selezionato non è quello loggato) */}
                {loggedUser?.role === 2 && (user ? user.id !== loggedUser?.id : true) ? (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ruolo</label>
                        <select
                            defaultValue={user?.role || 1}
                            name="role"
                            disabled={isPending}
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <option value='1'>Utente</option>
                            <option value='2'>Amministratore</option>
                        </select>
                    </div>
                ) : (<></>)}

                {/* Footer con bottoni di azione */}
                <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded text-sm cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded text-sm cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                {user ? 'Salvataggio...' : 'Creazione...'}
                            </>
                        ) : (
                            user ? 'Salva Modifiche' : 'Crea Utente'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}