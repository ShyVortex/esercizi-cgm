import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Dettaglio Stato",
    description: "Visualizza i dettagli di uno stato specifico",
};

export default function StateDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Link
                    href="/dashboard/states"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded transition-colors"
                >
                    ← Torna alla lista degli stati
                </Link>
            </div>
            {children}
        </div>
    );
}
