"use client";

import { useEffect, useState } from "react";
import { Cart } from "../models/types/Cart";
import { CartStorageService } from "../services/cart-storage.service";
import Link from "next/link";
import { Product } from "../models/types/Product";
import { CartHelper } from "../helpers/CartHelper";

export default function CartPage() {
    const [cart, setCart] = useState<Cart | undefined>(() => CartStorageService.getCartData());
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Carica i prodotti del carrello all'avvio
    useEffect(() => {
        const fetchCartProducts = async () => {
            try {
                const fetchedProducts = await CartHelper.getCartProducts();
                if (fetchedProducts) {
                    setProducts(fetchedProducts);
                }
            } catch (error) {
                console.error("Errore nel recupero dei prodotti del carrello", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCartProducts();
    }, []);

    // Trova la quantità di un determinato prodotto nel carrello
    const getProductQuantity = (productId: string): number => {
        const item = cart?.items.find(i => i.productId === productId);
        return item ? item.quantity : 0;
    };

    // Calcola il totale rispetto alla quantità
    const total: number = products.reduce((currentPrice, currentProduct) => {
        const quantity = getProductQuantity(currentProduct.id);
        return currentPrice + (currentProduct.price * quantity);
    },
        0 // currentPrice parte da 0
    );

    // Verifica se c'è bisogno di pagare la spedizione ed eventualmente quanto verrebbe
    const shipping: number = total > 29 ? 0 : (Math.max(Math.floor((products.length / 4)), 1) * 3.99);

    const shippingStyle: string = shipping > 0 ? 'text-xl text-orange-400' : 'text-xl text-green-400';

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-white text-center mt-10">
                Caricamento carrello...
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

            <h1 className="text-2xl font-bold mb-6">Carrello</h1>

            <div>
                {products.length === 0 ? (
                    <p className="text-gray-400">Il carrello è vuoto.</p>
                ) : (
                    <div className="space-y-4">
                        {products.map(product => {
                            const quantity = getProductQuantity(product.id);
                            return (
                                <div
                                    key={product.id}
                                    className="flex gap-8 justify-between items-center p-4 bg-gray-800 rounded border border-gray-700"
                                >
                                    <div>
                                        <h3 className="font-semibold text-lg">{product.name}</h3>
                                        <p className="text-sm text-gray-400">Prezzo unitario: {product.price}€</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm bg-blue-900 text-blue-200 px-3 py-1 rounded font-semibold">
                                            Quantità: {quantity}
                                        </span>
                                        <p className="mt-1 font-bold text-green-400">
                                            {(product.price * quantity).toFixed(2)}€
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="mt-6 pt-6 border-t border-gray-800 text-right">
                            <span className="text-gray-400 mr-2 text-lg">Spedizione:</span>
                            <span className={shippingStyle}>{shipping > 0 ? `${shipping}€` : 'Gratis'}</span>
                        </div>

                        <div className="text-right">
                            <span className="text-gray-400 mr-2 text-lg">Totale:</span>
                            <span className="text-2xl font-bold text-green-400">{(total + shipping).toFixed(2)}€</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
