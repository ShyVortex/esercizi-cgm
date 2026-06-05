"use client";

import { useEffect, useState } from "react";
import { Cart } from "../models/types/Cart";
import { CartStorageService } from "../services/cart-storage.service";
import Link from "next/link";
import { Product, ProductSet } from "../models/types/Product";
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

    const handleCartAddOrEdit = (product: Product) => {
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

    const handleCartRemove = (product: Product): void => {
        CartHelper.removefromCart(product.id);
        const newCart = CartStorageService.getCartData();
        setCart(newCart);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== product.id));
    };

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
                                    className="grid grid-cols-[1fr_150px_40px_40px] gap-6 items-center p-4 bg-gray-800 rounded border border-gray-700"
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
                                    <button
                                        className="cursor-pointer justify-self-center hover:scale-110 transition-transform"
                                        onClick={() => handleCartAddOrEdit(product)}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="cursor-pointer justify-self-center hover:scale-110 transition-transform"
                                        onClick={() => {
                                            if (confirm("Sei sicuro di voler rimuovere questo prodotto dal carrello?")) {
                                                handleCartRemove(product);
                                            }
                                        }}
                                    >
                                        🗑️
                                    </button>
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
