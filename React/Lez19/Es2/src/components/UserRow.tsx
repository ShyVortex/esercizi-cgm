import type { User } from "../types/User";

type Props = {
    user: User;
    onDelete: (user: User) => void;
}

export default function UserRow({ user: user, onDelete: deleteUser }: Props) {
    const roleText: string = user.role === 'User' ? 'Utente'
        : user.role === 'Moderator' ? 'Moderatore'
            : user.role === 'Admin' ? 'Amministratore' : 'Null';
    const actionText: string = 'Elimina';

    const buttonClass: string = "p-2 w-20 text-sm bg-gray-400 hover:bg-gray-300 text-black font-medium rounded cursor-pointer";
    let roleClass: string;

    switch (user.role) {
        case 'User':
            roleClass = "p-2 text-sm text-green-700 rounded";
            break;
        case 'Moderator':
            roleClass = "p-2 text-sm text-yellow-700 rounded";
            break;
        case 'Admin':
            roleClass = "p-2 text-sm text-red-700 rounded";
            break;
        default:
            roleClass = "p-2 text-sm text-gray-300 rounded";
            break;
    }

    return (
        <tr className="border-b last:border-0">
            <td className="p-4 text-sm text-gray-300">{user.id}</td>
            <td className="p-4 text-sm text-gray-300">{user.name}</td>
            <td className="p-4 text-sm text-gray-300">{user.surname}</td>
            <td className={roleClass}>{roleText}</td>
            <td className="p-4 text-right space-x-2">
                <button
                    className={buttonClass}
                    onClick={() => {
                        if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
                        else deleteUser(user);
                    }}
                >
                    {actionText}
                </button>
            </td>
        </tr>
    )
}   