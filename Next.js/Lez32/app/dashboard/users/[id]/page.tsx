import { userService } from "@/app/api/user.service";
import { User } from "@/models/types/User";
import ErrorTrigger from "@/app/components/ErrorTrigger";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

interface DetailProps {
    params: Promise<{ id: string }>;
}

export default async function UserDetail({ params }: DetailProps): Promise<React.ReactElement> {
    const { id } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    let user: User | undefined;
    try {
        user = await userService.getCachedUserDetail(id, true, token);
    } catch (error) {
        if (error instanceof Error && error.message === "SIMULATED_NOT_FOUND") {
            notFound();
        }
        const message = error instanceof Error ? error.message : "Errore durante il caricamento dell'utente";
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
            roleText = 'Utente Standard';
            roleClass = "text-lg text-green-400 font-medium rounded";
            break;
        case 2:
            roleText = 'Manager';
            roleClass = "text-lg text-yellow-400 font-medium rounded";
            break;
        case 3:
            roleText = 'Amministratore';
            roleClass = "text-lg text-red-400 font-semibold rounded";
            break;
        default:
            roleText = 'Sconosciuto';
            roleClass = "text-lg text-gray-300 rounded";
            break;
    }

    return (
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg space-y-4 max-w-2xl mx-auto">
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
