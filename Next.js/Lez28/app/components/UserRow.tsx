"use client";

import type { User } from "../models/types/User";
import { useParams, useRouter } from "next/navigation";

type Props = {
    user: User;
}

export default function UserRow({ user }: Props) {
    const router = useRouter();
    const params = useParams();

    // params.id corrisponde al parametro della cartella [id] nell'URL
    const activeId = params?.id ? params.id : undefined;
    const isExpanded = user.id === activeId;

    const activeText: string = user.isActive ? 'Attivo' : 'Inattivo'
    const btnExpandStyle: string = "p-2 w-20 text-sm bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer";

    const activeClass: string = user.isActive
        ? "p-4 text-sm text-green-400 font-medium"
        : "p-4 text-sm text-red-400 font-medium";

    const handleToggleExpand = () => {
        if (isExpanded) {
            router.push("/users"); // Chiude tornando alla lista principale
        } else {
            router.push(`/users/${user.id}`); // Apre navigando sul dettaglio dell'utente
        }
    };

    return (
        <>
            {/* Riga Principale */}
            <tr
                className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors duration-150"
            >
                <td className="p-4 text-sm text-gray-300">{user.id}</td>
                <td className="p-4 text-sm text-gray-300">{user.username}</td>
                <td className="p-4 text-sm text-gray-300">{user.email}</td>
                <td className={activeClass}>{activeText}</td>
                <td className="p-4 text-right space-x-2">
                    <button
                        className={btnExpandStyle}
                        onClick={handleToggleExpand}
                    >
                        Dettaglio
                    </button>
                </td>
            </tr>
        </>
    );
}
