"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { productsService } from "../../api/products.service";
import { Product, ProductSet } from "../../models/types/Product";
import Link from "next/link";
import { CartHelper } from "@/app/helpers/CartHelper";
import { Cart } from "@/app/models/types/Cart";
import { CartStorageService } from "@/app/services/cart-storage.service";

export default function ProductDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [cart, setCart] = useState<Cart | undefined>(() => CartStorageService.getCartData());

    const btnEditStyle: string = "w-40 p-2 text-sm bg-gray-400 hover:bg-gray-300 text-black font-semibold rounded cursor-pointer";
    const btnDeleteStyle: string = "w-40 p-2 text-sm bg-red-500 hover:bg-red-500 text-white font-semibold rounded cursor-pointer transition-colors duration-150";

    useEffect(() => {
        if (!id) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productsService.getProduct(id);
                setProduct(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Errore durante il caricamento del prodotto");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);


    const updateCart = (prodSet: ProductSet): void => {
        const storedCart: Cart | undefined = CartStorageService.getCartData();
        let updatedItems: ProductSet[] = [];
        if (storedCart) {
            const existingItemIndex: number = storedCart.items.findIndex(item => item.productId === prodSet.productId);
            updatedItems = [...storedCart.items];
            if (existingItemIndex !== -1) {
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: prodSet.quantity
                };
            } else {
                updatedItems.push(prodSet);
            }
        } else {
            updatedItems = [prodSet];
        }
        const newCart: Cart = {
            items: updatedItems,
            storedAt: new Date().getTime()
        };
        CartStorageService.setCartData(newCart);
        setCart(newCart); // Aggiorna lo stato per re-renderizzare
    };

    const handleCartAddOrEdit = () => {
        if (product) {
            const result: string | null = prompt("Seleziona una quantità");

            if (result === null) {
                return;
            }

            if (result.trim() === "" || isNaN(Number(result))) {
                alert("Non hai inserito un numero valido.");
                return;
            }

            const quantity: number = Number(result);

            if (quantity > product.stock) {
                alert(`Hai inserito un numero maggiore della quantità disponibile (${product.stock}).`);
                return;
            }

            const set: ProductSet = {
                productId: product.id,
                quantity: quantity
            };

            updateCart(set);
        }
    }

    const handleCartRemove = (product: Product): void => {
        CartHelper.removefromCart(product.id);
        const newCart = CartStorageService.getCartData();
        setCart(newCart);
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <p className="text-gray-400 animate-pulse text-lg">Caricamento in corso...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
                <p className="text-red-400 text-lg mb-4">{error || "Prodotto non trovato"}</p>
                <Link
                    href="/products"
                    className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                    Torna alla lista prodotti
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg mt-10 border border-gray-800">
            <div className="mb-6">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium rounded transition-colors"
                >
                    ← Torna alla lista
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Immagine Prodotto */}
                <div className="flex justify-center items-center bg-gray-850 rounded-lg overflow-hidden border border-gray-800 h-[350px]">
                    {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={product.image}
                            alt={product.name}
                            className="object-contain max-h-full max-w-full hover:scale-105 transition-transform duration-355"
                        />
                    ) : (
                        <div className="text-gray-500">Nessuna immagine disponibile</div>
                    )}
                </div>

                {/* Dettagli Prodotto */}
                <div className="flex flex-col justify-between space-y-6">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold px-2.5 py-0.5 bg-indigo-950/50 rounded-full border border-indigo-500/20">
                            {product.category}
                        </span>
                        <h1 className="text-3xl font-bold mt-3 text-gray-100">{product.name}</h1>
                        <p className="text-2xl font-semibold text-green-400 mt-2">{product.price}€</p>

                        <div className="mt-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descrizione</h4>
                            <p className="text-gray-300 mt-2 leading-relaxed text-sm">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-800 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Valutazione:</span>
                            <span className="text-yellow-400 font-medium font-semibold">★ {product.rating} / 5</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Disponibilità:</span>
                            <span className={product.stock > 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                                {product.stock > 0 ? `${product.stock} unità disponibili` : "Esaurito"}
                            </span>
                        </div>

                        {!CartHelper.existsInCart(product.id) ? (
                            <button
                                onClick={handleCartAddOrEdit}
                                disabled={product.stock <= 0}
                                className="w-full mt-4 py-3 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg cursor-pointer transition-colors duration-150 shadow"
                            >
                                {product.stock > 0 ? "Aggiungi al carrello" : "Prodotto esaurito"}
                            </button>
                        ) : (
                            <div className="flex gap-6">
                                <button
                                    className={btnEditStyle}
                                    onClick={handleCartAddOrEdit}
                                >
                                    Modifica quantità
                                </button>
                                <button
                                    className={btnDeleteStyle}
                                    onClick={() => {
                                        if (confirm("Sei sicuro di voler rimuovere questo prodotto dal carrello?")) {
                                            handleCartRemove(product);
                                        }
                                    }}
                                >
                                    Rimuovi dal carrello
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
