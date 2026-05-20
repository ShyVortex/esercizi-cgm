import React, { type ChangeEvent } from "react";

type Props = {
    choice: string
    onChange: (newChoice: string) => void
}

export default function RoleFilter({ choice, onChange }: Props): React.ReactElement {
    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Filtra per ruolo:</label>
            <select id="userFilter"
                value={choice}
                onChange={(e: ChangeEvent<HTMLSelectElement>): void => onChange(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tutti</option>
                <option value="User">Utenti</option>
                <option value="Moderator">Moderatori</option>
                <option value="Admin">Amministratori</option>
            </select>
        </div>
    )
}