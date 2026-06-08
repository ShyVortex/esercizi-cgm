"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function ActiveFilter({ value }: { value: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const bool = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("isActive", bool);

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Filtra per stato:</label>
            <select id="userFilter"
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                <option className="text-black" value={""}>Tutti</option>
                <option className="text-black" value={"active"}>Attivi</option>
                <option className="text-black" value={"inactive"}>Non attivi</option>
            </select>
        </div>
    )
}