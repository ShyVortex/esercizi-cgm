"use client";

import type React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function ActiveFilter({ value }: { value: string }): React.ReactElement {
    const router: AppRouterInstance = useRouter();
    const searchParams: ReadonlyURLSearchParams = useSearchParams();
    const pathname: string = usePathname();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        const selectedValue: string = event.target.value;
        const params: URLSearchParams = new URLSearchParams(searchParams.toString());
        params.set("isActive", selectedValue);
        params.set("page", "1");

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600">Filtra per stato:</label>
            <select
                id="userActiveFilter"
                value={value}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
                <option value="">Tutti</option>
                <option value="active">Attivi</option>
                <option value="inactive">Non attivi</option>
            </select>
        </div>
    );
}
