"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Select, { SingleValue, StylesConfig } from "react-select";

type OptionType = {
    value: string;
    label: string;
};

interface Props {
    value: string;
    options: OptionType[];
    label: string;
    paramName: string;
    placeholder?: string;
}

const customStyles: StylesConfig<OptionType, false> = {
    control: (provided) => ({
        ...provided,
        backgroundColor: "#111827", // bg-gray-900
        borderColor: "#374151",     // border-gray-700
        minHeight: "38px",
        color: "#f3f4f6"            // text-gray-100
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "#e5e7eb"            // text-gray-200
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: "#1f2937", // bg-gray-800
        borderColor: "#374151"
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected 
            ? "#2563eb"             // bg-blue-600
            : state.isFocused 
                ? "#374151"         // bg-gray-700
                : "#1f2937",
        color: "#f3f4f6",
        cursor: "pointer"
    })
};

export default function ReactSelectFilter({ value, options, label, paramName, placeholder = "Seleziona..." }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [, startTransition] = useTransition();

    const selectedOption = options.find((opt) => opt.value === value) || null;

    const handleChange = (newValue: SingleValue<OptionType>) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newValue && newValue.value) {
            params.set(paramName, newValue.value);
        } else {
            params.delete(paramName);
        }
        params.set("page", "1");

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="flex flex-col gap-1 min-w-[200px] text-left">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
            <Select
                value={selectedOption}
                onChange={handleChange}
                options={options}
                styles={customStyles}
                placeholder={placeholder}
                isClearable
            />
        </div>
    );
}
