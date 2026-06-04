import { Product, ProductSet } from "../models/types/Product";
import ProductRow from "./ProductRow";

type Props = {
    products: Product[];
    onCartAdd: (productSet: ProductSet) => void;
    onCartEdit: (productSet: ProductSet) => void;
    onCartRemove: (product: Product) => void;
}

export default function ProductList({ products: users, onCartAdd: addToCart, onCartEdit: editInCart, onCartRemove: removeFromCart }: Props) {
    return (
        <div id="tableContainer" className="rounded shadow overflow-hidden">
            <table className="w-full text-left border-collapse bg-gray-800">
                <thead className="bg-gray-500">
                    <tr id="tableHead">
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Product ID</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Nome</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Prezzo</th>
                        <th className="p-4 border-b uppercase text-xs text-gray-900 font-bold">Categoria</th>
                        <th className="p-4 border-b uppercase text-right text-xs text-gray-900 font-bold">Azioni</th>
                    </tr>
                </thead>
                <tbody id="tableBody">
                    {users.map(user => (
                        <ProductRow
                            key={user.id}
                            product={user}
                            onCartAdd={addToCart}
                            onCartEdit={editInCart}
                            onCartRemove={removeFromCart}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}