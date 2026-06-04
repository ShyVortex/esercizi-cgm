import React, { type ChangeEvent } from "react";

type Props = {
    value: number
    onChange: (newSize: number) => void;
}

export default function SizeSelector(props: Props): React.ReactElement {
    const selected: number = props.value;

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Attività per pagina:</label>
            <select
                id="pageSize"
                value={selected}
                onChange={(e: ChangeEvent<HTMLSelectElement>): void => props.onChange(Number(e.target.value))}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
                <option className="text-black" value="5">5</option>
                <option className="text-black" value="10">10</option>
                <option className="text-black" value="15">15</option>
                <option className="text-black" value="20">20</option>
                <option className="text-black" value="25">25</option>
            </select>
        </div>
    )
}