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

    public async getProduct(id: string): Promise<Product> {
        return await apiService.get(`${BASE_ENDPOINT}/${id}`);
    }
}

export const productsService = new ProductsService();