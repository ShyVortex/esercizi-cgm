import type React from "react";
import RouteComponent from "../components/RouteComponent";
import type { User } from "../models/types/User";
import { AuthStorageService } from "../services/auth-storage.service";

export default function PrivatePage(): React.ReactElement {
    const user: User | undefined = AuthStorageService.getUser() as User;

    return (
        <div>
            <RouteComponent />
            <div className="mt-30 flex flex-col items-center justify-center p-12 bg-gray-800/40 rounded-xl border border-gray-700/50 shadow-md text-center">
                <div className="text-4xl mb-4">🔐</div>
                <p className="text-gray-300 font-medium text-lg">Pagina Privata</p>
                <div className="mt-10 text-4xl mb-4">
                    <p className="pb-3 text-gray-300 font-sm text-base">Ciao, {user.firstName}!</p>
                    <p className="text-gray-300 font-sm text-base">Questa pagina è accessibile solo agli utenti registrati.</p>
                </div>

                <div className="mt-10 text-4xl mb-4">
                    <p className="pb-3 text-gray-300 font-medium text-lg">Dettagli Utente</p>
                    <p className="pb-3 text-gray-300 font-sm text-base">{user.firstName} {user.middleName} {user.lastName}</p>
                    <p className="pb-3 text-gray-300 font-sm text-base">{user.username}</p>
                    <p className="pb-3 text-gray-300 font-sm text-base">{user.email}</p>
                </div>
            </div>
        </div>
    );
}