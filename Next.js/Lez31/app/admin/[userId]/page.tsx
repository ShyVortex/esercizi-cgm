import { userService } from "@/app/api/user.service";
import { User } from "@/models/types/User";
import ErrorTrigger from "../error-trigger";
import { notFound } from "next/navigation";

interface DetailProps {
    params: Promise<{ userId: string }>;
}

export default async function UserDetail({ params }: DetailProps): Promise<React.ReactElement> {
    const { userId } = await params;

    let user: User | undefined;
    try {
        user = await userService.getCachedUserDetail(userId, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Errore durante il caricamento del prodotto";
        return <ErrorTrigger message={message} />;
    }

    if (!user) {
        notFound();
    }

    const activeText: string = user.isActive ? 'Attivo' : 'Inattivo';

    let roleText: string;
    let roleClass: string;

    switch (user.role) {
        case 1:
            roleText = 'Utente';
            roleClass = "text-lg text-green-700 rounded";
            break;
        case 2:
            roleText = 'Amministratore';
            roleClass = "text-lg text-red-700 rounded";
            break;
        default:
            roleText = 'Null';
            roleClass = "text-lg text-gray-300 rounded";
            break;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg space-y-4">
            <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
                Dettagli Utente: {user.firstName} {user.lastName}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                    <span className="text-gray-500 block text-xs">Username</span>
                    <span className="text-gray-200 font-medium text-lg">{user.username}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Email</span>
                    <span className="text-gray-200 font-medium text-lg">{user.email}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Nome completo</span>
                    <span className="text-gray-200 font-medium text-lg">
                        {user.firstName} {user.middleName ? `${user.middleName} ` : ''}{user.lastName}
                    </span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Stato</span>
                    <span className="text-gray-200 font-medium text-lg">{activeText}</span>
                </div>
                <div>
                    <span className="text-gray-500 block text-xs">Ruolo</span>
                    <span className={roleClass}>{roleText}</span>
                </div>
            </div>
        </div>
    );
}
