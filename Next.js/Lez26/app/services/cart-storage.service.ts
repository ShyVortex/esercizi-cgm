import { Cart } from "../models/types/Cart";
import { ProductSet } from "../models/types/Product";

export abstract class CartStorageService {
    private static CART_KEY: string = 'app_cart';

    public static getCartData(): Cart | undefined {
        try {
            const cartCache: string | null = localStorage.getItem(this.CART_KEY);

            const cartData: Cart | undefined = cartCache ? JSON.parse(cartCache) : undefined;

            if (!cartData ||
                !Object.hasOwn(cartData, "items") ||
                !Object.hasOwn(cartData, "storedAt")
            ) {
                localStorage.removeItem(this.CART_KEY);
                return undefined;
            }

            if (cartCache) {
                try {
                    return JSON.parse(cartCache) as Cart;
                } catch (error) {
                    console.error("Errore nel parsing dei task da LocalStorage, ricarico il JSON di default:", error);
                }
            }

            const oneHourInMs = 3600 * 1000;
            const hasExpired = (new Date().getTime() - cartData.storedAt) > oneHourInMs;

            if (hasExpired) {
                localStorage.removeItem(this.CART_KEY);
                return undefined;
            }

            return cartData;
        } catch {
            return undefined;
        }
    }

    public static getItems(): ProductSet[] | undefined {
        return this.getCartData()?.items;
    }

    public static getStoredAt(): number | undefined {
        return this.getCartData()?.storedAt;
    }

    public static setCartData(data: Cart): void {
        localStorage.setItem(this.CART_KEY, JSON.stringify(data));
    }

    public static removeCartData(): void {
        localStorage.removeItem(this.CART_KEY);
    }

    public static hasCacheExpired() {
        const timeStored = this.getStoredAt();

        if (timeStored === undefined) {
            return true;
        }

        const oneHourInMs = 3600 * 1000;
        return (new Date().getTime() - timeStored) > oneHourInMs;
    }
}