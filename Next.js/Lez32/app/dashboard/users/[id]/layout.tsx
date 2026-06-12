import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Dettaglio Utente",
    description: "Visualizza i dettagli di un utente specifico",
};

export default function UserDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Link
                    href="/dashboard/users"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded transition-colors"
                >
                    ← Torna alla lista degli utenti
                </Link>
            </div>
            {children}
        </div>
    );
}
