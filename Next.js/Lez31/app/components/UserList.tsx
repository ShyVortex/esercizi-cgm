import UserRow from "./UserRow";
import type { User } from "@/models/types/User";

type Props = {
    users: User[];
}

export default function UserList({ users }: Props): React.ReactElement {
    return (
        <div id="tableContainer" className="rounded shadow overflow-hidden">
            <table className="w-full text-left border-collapse bg-gray-800">
                <thead className="bg-gray-500">
                    <tr id="tableHead">
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">User ID</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Username</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Email</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Ruolo</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Stato</th>
                        <th className="p-4 border-b uppercase text-right text-xs text-gray-900 font-bold">Azioni</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {users.map(user => (
                        <UserRow
                            key={user.id}
                            user={user}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}