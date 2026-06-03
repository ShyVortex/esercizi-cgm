import Modal from 'react-modal';
import type { User } from '../models/types/User';
import React, { useState } from 'react';
import type { SaveUserRequest } from '../models/requests/user-requests';
import { AuthStorageService } from '../services/auth-storage.service';

// Assicura l'accessibilità del modale
if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: SaveUserRequest) => void;
    user?: User | null;
}

export default function CustomModal({ isOpen, onClose, onSubmit, user }: Props) {
    const loggedUser: User | undefined = AuthStorageService.getUser();
    const [showPassword, setShowPassword] = useState(false);

    const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);

        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string | undefined;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const middleName = formData.get('middleName') as string;
        const roleSelect = formData.get('role') as FormDataEntryValue | undefined;

        let role: number | undefined;
        if (roleSelect && roleSelect != '') {
            role = Number(roleSelect);
        }

        const userData: SaveUserRequest = {
            id: user ? user.id : undefined,
            username: username,
            email: email,
            firstName: firstName,
            middleName: (middleName && middleName.trim() !== '') ? middleName.trim() : undefined,
            lastName: lastName,
            role: role
        }

        if (!user) {
            if (password) {
                userData.password = password;
            }
        } else {
            if (password && password.trim() !== '') {
                userData.password = password;
            }
        }

        console.log("Inviando userData al server:", userData);

        onSubmit(userData);
    };

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
                    className="text-gray-400 hover:text-white text-2xl font-bold cursor-pointer transition-colors duration-150 leading-none"
                >
                    &times;
                </button>
            </div>

            {/* Form Interno (il key resetta i campi se cambia utente o modalità) */}
            <form
                key={user ? `edit-${user.id}` : 'create'}
                onSubmit={handleFormSubmit}
                className="p-6 space-y-4 text-left"
            >
                {/* Username */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
                    <input
                        type="text"
                        required
                        name="username"
                        defaultValue={user?.username || ''}
                        placeholder="es. m.rossi"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <input
                        type="email"
                        required
                        name="email"
                        defaultValue={user?.email || ''}
                        placeholder="es. marco.rossi@example.com"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Password (visibile solo se l'utente loggato è amministratore) */}
                {loggedUser?.role === 3 && (
                    <div className="flex flex-col gap-1">
                        <label htmlFor='password' className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required={!user}
                                name="password"
                                placeholder="••••••••"
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
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
                    </div>
                )}

                {/* Grid per Nome e Cognome */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome</label>
                        <input
                            type="text"
                            required
                            name="firstName"
                            defaultValue={user?.firstName || ''}
                            placeholder="Marco"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cognome</label>
                        <input
                            type="text"
                            required
                            name="lastName"
                            defaultValue={user?.lastName || ''}
                            placeholder="Rossi"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
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
                        defaultValue={user?.middleName ? user.middleName : ''}
                        placeholder="es. Luigi"
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Ruolo (visibile solo se l'utente loggato è admin e l'utente selezionato non è quello loggato) */}
                {loggedUser?.role === 3 && (user ? user.id !== loggedUser?.id : true) ? (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ruolo</label>
                        <select
                            defaultValue={user?.role || 1}
                            required
                            name="role"
                            className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors">
                            <option value='1'>Lettore</option>
                            <option value='2'>Editore</option>
                            <option value='3'>Amministratore</option>
                        </select>
                    </div>
                ) : (<></>)}

                {/* Footer con bottoni di azione */}
                <div className="pt-4 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 font-medium rounded text-sm cursor-pointer transition-colors duration-150"
                    >
                        Annulla
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded text-sm cursor-pointer transition-colors duration-150"
                    >
                        {user ? 'Salva Modifiche' : 'Crea Utente'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}