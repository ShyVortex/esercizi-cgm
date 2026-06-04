import { CartHelper } from "../helpers/CartHelper";
import { Product, ProductSet } from "../models/types/Product";
import Link from "next/link";

type Props = {
    product: Product;
    onCartAdd: (productSet: ProductSet) => void;
    onCartEdit: (productSet: ProductSet) => void;
    onCartRemove: (product: Product) => void;
}

export default function ProductRow({ product, onCartAdd: addToCart, onCartEdit: editInCart, onCartRemove: removeFromCart }: Props) {
    const btnAddStyle: string = "w-40 p-2 font-semibold text-sm bg-blue-700 hover:bg-blue-500 text-white rounded cursor-pointer";
    const btnEditStyle: string = "w-40 p-2 text-sm bg-gray-400 hover:bg-gray-300 text-black font-semibold rounded cursor-pointer";
    const btnDeleteStyle: string = "w-40 p-2 text-sm bg-red-500 hover:bg-red-500 text-white font-semibold rounded cursor-pointer transition-colors duration-150";

    const handleCartAddOrEdit = () => {
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

        addToCart(set);
    }

    return (
        <tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors duration-150">
            <td className="p-0 text-sm">
                <Link href={`/products/${product.id}`} className="block p-4 text-gray-300">
                    {product.id}
                </Link>
            </td>
            <td className="p-0 text-sm">
                <Link href={`/products/${product.id}`} className="block p-4 text-gray-300 font-semibold hover:underline">
                    {product.name}
                </Link>
            </td>
            <td className="p-0 text-sm">
                <Link href={`/products/${product.id}`} className="block p-4 text-gray-300">
                    {product.price}€
                </Link>
            </td>
            <td className="p-0 text-sm">
                <Link href={`/products/${product.id}`} className="block p-4 text-gray-300">
                    {product.category}
                </Link>
            </td>
            <td className="p-4 text-right space-x-2">
                {!CartHelper.existsInCart(product.id) ? (
                    <button
                        className={btnAddStyle}
                        onClick={handleCartAddOrEdit}
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? "Aggiungi al carrello" : "Prodotto esaurito"}
                    </button>) : (
                    <>
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
                                    removeFromCart(product);
                                }
                            }}
                        >
                            Rimuovi dal carrello
                        </button>
                    </>
                )}
            </td>
        </tr>
    );
}
