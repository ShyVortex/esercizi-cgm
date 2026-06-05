import { sleep } from "../helpers/sleep";
import { GetFPProductsRequest } from "../models/requests/product-requests";
import { GetFPProductsResponse } from "../models/responses/product-responses";
import { Product } from "../models/types/Product";
import { apiService } from "./api.service";

const BASE_ENDPOINT: string = '/products';

export class ProductsService {
    public emptyResponse: GetFPProductsResponse = {
        first: 0,
        prev: null,
        next: null,
        last: 0,
        pages: 0,
        items: 0,
        data: []
    }

    private async runSimulations(): Promise<undefined | string> {
        // Simula il caricamento
        await sleep(1000 + Math.random() * 2000);

        // Simula l'errore (5% probabilità)
        const isError: boolean = Math.random() < 0.05;
        if (isError)
            throw new Error("Errore nel caricamento dei dati");

        // Simula not-found (5% probabilità)
        const isEmpty: boolean = Math.random() < 0.05;
        if (isEmpty) {
            return undefined;
        } else {
            return "Success";
        }
    }

    public async getProducts(): Promise<Product[]> {
        return await apiService.get(BASE_ENDPOINT);
    }

    public async getFilteredPaginatedProducts(request: GetFPProductsRequest): Promise<GetFPProductsResponse> {
        let _page: string = '';
        let _per_page: string = '';
        let _category: string = '';

        if (request.page) _page = `_page=${request.page}&`;
        if (request.per_page) _per_page = `_per_page=${request.per_page}&`;
        if (request.filter) {
            _category = `category=${encodeURIComponent(request.filter)}&`;
        }

        return await apiService.get(`${BASE_ENDPOINT}?${_page}${_per_page}${_category}`);
    }

    public async getProduct(id: string, simulate: boolean = false): Promise<Product | undefined> {
        if (simulate) {
            try {
                const result: string | undefined = await this.runSimulations();

                if (!result) return undefined;
                else if (result && typeof result === 'string' && result === 'Success') {
                    console.log("--- SIMULAZIONI ESEGUITE CON SUCCESSO ---");
                }
            } catch (error) {
                throw error;
            }
        }

        return await apiService.get(`${BASE_ENDPOINT}/${id}`);
    }
}

export const productsService = new ProductsService();