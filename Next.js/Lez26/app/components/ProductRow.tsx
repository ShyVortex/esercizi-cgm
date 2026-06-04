import { Product, ProductSet } from "../models/types/Product";
import Link from "next/link";

type Props = {
    product: Product;
    onCartAdd: (productSet: ProductSet) => void;
}

export default function ProductRow({ product, onCartAdd: addToCart }: Props) {
    const btnEditStyle: string = "w-40 p-2 font-semibold text-sm bg-blue-700 hover:bg-blue-500 text-white font-medium rounded cursor-pointer";

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
                <button
                    className={btnEditStyle}
                    onClick={() => {
                        const result: string | null = prompt("Seleziona una quantità");
                        if (result && !Number(result)) alert("Non hai inserito un numero.");
                        else if (result && Number(result) > product.stock) alert(`Hai inserito un numero maggiore della quantità disponibile (${product.stock}).`)
                        else {
                            const quantity: number = Number(result);
                            const set: ProductSet = {
                                productId: product.id,
                                quantity: quantity
                            };

                            addToCart(set);
                        }
                    }}
                >
                    Aggiungi al carrello
                </button>
            </td>
        </tr>
    );
}
