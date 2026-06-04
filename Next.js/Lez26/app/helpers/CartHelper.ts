import { Cart } from "../models/types/Cart";
import { ProductSet } from "../models/types/Product";
import { CartStorageService } from "../services/cart-storage.service";

export abstract class CartHelper {
    public static existsInCart(productId: string): boolean {
        const storedCart = CartStorageService.getCartData();
        if (!storedCart) return false;

        const existingIndex: number = storedCart.items.findIndex(item => item.productId === productId);

        if (existingIndex === -1) return false;

        return true;
    }

    public static removefromCart(productId: string): void {
        const storedCart = CartStorageService.getCartData();
        if (storedCart && this.existsInCart(productId)) {
            const filteredProductSets: ProductSet[] = storedCart.items.filter(item => item.productId !== productId);
            const filteredCart: Cart = {
                items: filteredProductSets,
                storedAt: new Date().getTime()
            }

            if (filteredCart.items.length > 0) {
                CartStorageService.setCartData(filteredCart);
            } else {
                CartStorageService.removeCartData();
            }
        } else {
            throw new Error("Given product not in cart");
        }
    }
}