import { notFound } from "next/navigation";
import { productsService } from "../../api/products.service";
import ProductDetailClient from "./client";
import { Product } from "@/app/models/types/Product";
import ErrorTrigger from "./error-trigger";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
    const { id } = await params;

    // Avviamo il recupero con simulazione attiva
    let product: Product | undefined;
    try {
        product = await productsService.getProduct(id, true);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Errore durante il caricamento del prodotto";
        return <ErrorTrigger message={message} />;
    }


    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}
