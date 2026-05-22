import Modal from 'react-modal';
import type { User } from '../types/User';
import React from 'react';

// Assicura l'accessibilità del modale
if (typeof window !== 'undefined') {
    Modal.setAppElement('#root');
}

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (userData: Omit<User, 'id' | 'isActive'>) => void;
    user?: User | null;
}

export default function CustomModal({ isOpen, onClose, onSubmit, user }: Props) {
    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const username = formData.get('username') as string;
        const email = formData.get('email') as string;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const middleName = formData.get('middleName') as string;

        const userData: Omit<User, 'id' | 'isActive'> = {
            username,
            email,
            firstName,
            lastName,
        };

        if (middleName && middleName.trim() !== '') {
            userData.middleName = middleName.trim();
        }

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