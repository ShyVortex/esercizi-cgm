import React from "react";
import Link from "next/link";

export interface Column<T> {
    key: string;
    label: string;
    render?: (item: T) => React.ReactNode;
    headerClassName?: string;
    cellClassName?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: (item: T) => string | number;
    getRowUrl?: (item: T) => string;
}

export default function DataTable<T>({
    columns,
    data,
    rowKey,
    getRowUrl
}: DataTableProps<T>): React.ReactElement {
    return (
        <div id="tableContainer" className="rounded-xl border border-gray-700/50 shadow-lg bg-gray-800/60 backdrop-blur-md w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
                <thead className="bg-gray-700/50">
                    <tr id="tableHead" className="border-b border-gray-700">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`p-4 uppercase text-xs text-gray-300 font-bold tracking-wider ${col.headerClassName || ""}`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-8 text-center text-gray-400 text-sm">
                                Nessun dato disponibile
                            </td>
                        </tr>
                    ) : (
                        data.map((item) => (
                            <tr
                                key={rowKey(item)}
                                className="border-b border-gray-700/50 hover:bg-gray-700/40 transition-colors duration-150"
                            >
                                {columns.map((col) => {
                                    const content = col.render ? col.render(item) : (item[col.key as keyof T] as unknown as React.ReactNode);
                                    const isActions = col.key === "actions";
                                    return (
                                        <td
                                            key={col.key}
                                            className={`p-4 text-sm text-gray-300 ${col.cellClassName || ""}`}
                                        >
                                            {!isActions && getRowUrl ? (
                                                <Link href={getRowUrl(item)} className="block hover:text-blue-400 transition-colors">
                                                    {content}
                                                </Link>
                                            ) : (
                                                content
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
