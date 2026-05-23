import UserRow from "./UserRow.tsx";
import type { User } from "../models/types/User.ts";

type Props = {
    users: User[];
    onUpdate: (updatedUser: User) => void;
    onDelete: (deletedUser: User) => void;
}

export default function UserList({ users: users, onUpdate: updateUser, onDelete: deleteUser }: Props) {
    return (
        <div id="tableContainer" className="rounded shadow overflow-hidden">
            <table className="w-full text-left border-collapse bg-gray-800">
                <thead className="bg-gray-500">
                    <tr id="tableHead">
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">User ID</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Username</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Email</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Stato</th>
                        <th className="p-4 border-b uppercase text-right text-xs text-gray-900 font-bold">Azioni</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {users.map(user => (
                        <UserRow
                            key={user.id}
                            user={user}
                            onUpdate={updateUser}
                            onDelete={deleteUser}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}