import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Product details",
    description: "Details of a product given its ID",
};

export default function ProductDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <div className="mb-6">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded transition-colors"
                >
                    ← Torna alla lista prodotti
                </Link>
            </div>
            {children}
        </div>
    );
}