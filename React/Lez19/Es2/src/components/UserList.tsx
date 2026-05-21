import UserRow from "./UserRow.tsx";
import type { User } from "../types/User.ts";

type Props = {
    users: User[];
    onDelete: (deletedUser: User) => void;
}

export default function UserList({ users: users, onDelete: deleteUser }: Props) {
    return (
        <div id="tableContainer" className="rounded shadow overflow-hidden">
            <table className="w-full text-left border-collapse bg-gray-800">
                <thead className="bg-gray-500">
                    <tr id="tableHead">
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">User ID</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Nome</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Cognome</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Ruolo</th>
                        <th className="p-4 border-b uppercase text-right text-xs text-gray-900 font-bold">Azione</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {users.map(task => (
                        <UserRow
                            key={task.id}
                            user={task}
                            onDelete={deleteUser}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}