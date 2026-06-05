import React, { type ChangeEvent } from "react";

type Props = {
    choice: string
    onChange: (newChoice: string) => void
}

export default function CategoryFilter({ choice, onChange }: Props): React.ReactElement {
    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Filtra per categoria:</label>
            <select id="userFilter"
                value={choice}
                onChange={(e: ChangeEvent<HTMLSelectElement>): void => onChange(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option className="text-black" value="">Tutte</option>
                <option className="text-black" value="Elettronica">Elettronica</option>
                <option className="text-black" value="Abbigliamento">Abbigliamento</option>
                <option className="text-black" value="Accessori">Accessori</option>
                <option className="text-black" value="Casa e Cucina">Casa e Cucina</option>
                <option className="text-black" value="Sport e tempo libero">Sport e tempo libero</option>
            </select>
        </div>
    )
}