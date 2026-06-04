"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { productsService } from "../api/products.service";
import PaginationComponent from "../components/Pagination";
import SizeSelector from "../components/SizeSelector";
import { GetFPProductsRequest } from "../models/requests/product-requests";
import { GetFPProductsResponse } from "../models/responses/product-responses";
import { PreferencesService } from "../services/preferences.service";
import ProductList from "../components/ProductList";
import CategoryFilter from "../components/CategoryFilter";

export default function ProductsPage() {
    const [products, setProducts] = useState<GetFPProductsResponse>(productsService.emptyResponse);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(() => PreferencesService.loadPreferences().pageSize);
    const [filter, setFilter] = useState<string>(() => PreferencesService.loadPreferences().filter);

    // Risolve la race condition con React.StrictMode
    const fetchIdRef = useRef<number>(0);

    const style: React.CSSProperties = {
        marginTop: '40px'
    }

    // Caricamento asincrono degli utenti
    // useCallback() riesegue la funzione quando vengono modificate le variabili osservate
    const fetchProducts = useCallback(async () => {
        const currentFetchId = ++fetchIdRef.current;
        try {
            const request: GetFPProductsRequest = {
                page: currentPage,
                per_page: pageSize,
                filter: filter
            }

            const response: GetFPProductsResponse = await productsService.getFilteredPaginatedProducts(request);
            if (currentFetchId === fetchIdRef.current) {
                setProducts(response);
            }
        } catch (err) {
            if (currentFetchId === fetchIdRef.current) {
                alert("Errore durante il caricamento degli utenti");
            }
        }
    }, [currentPage, pageSize, filter]);

    // Effettua il fetch iniziale e ad ogni cambio di stato di paginazione/filtro
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Quando le preferenze vengono aggiornate, le salviamo in cache
    useEffect(() => {
        PreferencesService.savePreference('pageSize', pageSize);
        PreferencesService.savePreference('filter', filter);
    }, [pageSize, filter]);

    const totalPages: number = products.pages || 1;

    // Aggiorna la lista utenti con la nuova pagina
    const handleCurrentPageChange = (newPage: number): void => {
        setCurrentPage(newPage);
    }

    // Quando cambia il numero di elementi per pagina,
    // si resetta la pagina corrente a 1 per evitare errori di out-of-bounds
    const handlePageSizeChange = (newSize: number): void => {
        setPageSize(newSize);
        setCurrentPage(1);
    };

    // Quando cambia il filtro, facciamo la stessa cosa
    const handleFilterChange = (newChoice: string): void => {
        setFilter(newChoice);
        setCurrentPage(1);
    }

    const btnCartStyle: string = "mt-10 pt-2 pb-2 pl-3 pr-3 w-45 bg-yellow-600 hover:bg-yellow-500 text-white hover:text-black font-medium rounded cursor-pointer transition-colors duration-150";


    return (
        <>
            <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handleCurrentPageChange}
            />
            <div className="flex flex-wrap flex-row gap-8 justify-center items-center">
                <SizeSelector
                    value={pageSize}
                    onChange={handlePageSizeChange}
                />
                <CategoryFilter
                    choice={filter}
                    onChange={handleFilterChange}
                />
                <button
                    className={btnCartStyle}
                >
                    Vai al carrello
                </button>
            </div>
            <div style={style} className="transition-opacity duration-200">
                <ProductList
                    products={products.data || []}
                    onCartAdd={() => { }}
                />
            </div>
        </>
    )
}