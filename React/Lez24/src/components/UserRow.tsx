import { useState } from "react";
import { Role, type User } from "../models/types/User";
import { AuthStorageService } from "../services/auth-storage.service";

type Props = {
    user: User;
    onUpdate: (user: User) => void;
    onDelete: (user: User) => void;
}

export default function UserRow({ user, onUpdate: updateUser, onDelete: deleteUser }: Props) {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const loggedUser: User | undefined = AuthStorageService.getUser();

    const roleText: string = user.role === Role.READER ? 'Lettore'
        : user.role === Role.EDITOR ? 'Editore'
            : user.role === Role.ADMIN ? 'Amministratore' : 'Null';

    let roleClass: string;

    switch (user.role) {
        case Role.READER:
            roleClass = "p-2 text-sm text-green-700 rounded";
            break;
        case Role.EDITOR:
            roleClass = "p-2 text-sm text-yellow-700 rounded";
            break;
        case Role.ADMIN:
            roleClass = "p-2 text-sm text-red-700 rounded";
            break;
        default:
            roleClass = "p-2 text-sm text-gray-300 rounded";
            break;
    }

    const btnEditStyle: string = "p-2 w-20 text-sm bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer";
    const btnDeleteStyle: string = "p-2 w-20 text-sm bg-red-500 hover:bg-red-500 text-white font-medium rounded cursor-pointer transition-colors duration-150";

    return (
        <>
            {/* Riga Principale */}
            <tr
                className="border-b border-gray-700 hover:bg-gray-700/30 cursor-pointer transition-colors duration-150"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td className="p-4 text-sm text-gray-300">{user.id}</td>
                <td className="p-4 text-sm text-gray-300">{user.username}</td>
                <td className="p-4 text-sm text-gray-300">{user.email}</td>
                <td className={roleClass}>{roleText}</td>
                {loggedUser.role !== Role.READER ?
                    (<td className="p-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        {/* e.stopPropagation() evita che cliccando su Elimina si espanda/comprima la riga */}
                        <button
                            className={btnEditStyle}
                            onClick={() => {
                                updateUser(user);
                            }}
                        >
                            Modifica
                        </button>
                        {loggedUser.role === Role.ADMIN ? (
                            <button
                                className={btnDeleteStyle}
                                onClick={() => {
                                    if (confirm("Sei sicuro di voler eliminare questo utente?")) {
                                        deleteUser(user);
                                    }
                                }}
                            >
                                Elimina
                            </button>
                        ) : (<></>)}
                    </td>) : (<></>)}
            </tr>

            {/* Dettagli Espansi */}
            {isExpanded && (
                <tr className="bg-gray-900/40 border-b border-gray-700">
                    <td colSpan={5} className="p-4 text-gray-300">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 space-y-3">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Dettagli Utente</h4>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block text-xs">Username</span>
                                    <span className="text-gray-200 font-medium">{user.username}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Email</span>
                                    <span className="text-gray-200 font-medium">{user.email}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Nome</span>
                                    <span className="text-gray-200 font-medium">{user.firstName}</span>
                                </div>
                                {user.middleName ? (
                                    <div>
                                        <span className="text-gray-500 block text-xs">Secondo Nome</span>
                                        <span className="text-gray-200 font-medium">{user.middleName}</span>
                                    </div>
                                ) : ('')}
                                <div>
                                    <span className="text-gray-500 block text-xs">Cognome</span>
                                    <span className="text-gray-200 font-medium">{user.lastName}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block text-xs">Ruolo</span>
                                    <span className="text-gray-200 font-medium">{roleText}</span>
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
