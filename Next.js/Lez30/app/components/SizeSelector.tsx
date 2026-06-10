"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function SizeSelector({ value }: { value: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = event.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set("per_page", newSize);
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Attività per pagina:</label>
            <select
                id="pageSize"
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm"
            >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
            </select>
        </div>
    );
}
