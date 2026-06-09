"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function RoleFilter({ value }: { value: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("filter", selectedValue);
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 text-left">Filtra per ruolo:</label>
            <select id="userFilter"
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option value="">Tutti</option>
                <option value="reader">Lettori</option>
                <option value="editor">Editori</option>
                <option value="admin">Amministratori</option>
            </select>
        </div>
    )
}