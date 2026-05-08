import { Item } from "../types/item.js";
import { BASE_URL } from "../utilities/api.js";

export class ItemService {
    static async getItem(resource: string, id: string): Promise<Item> {
        const itemRes = await fetch(`${BASE_URL}/${resource}/${id}`);
        const item = await itemRes.json();

        return item;
    }

    static async createItem(resource: string, body: Record<string, any>): Promise<void> {
        await fetch(`${BASE_URL}/${resource}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    static async updateItem(resource: string, id: string, body: Record<string, any>): Promise<void> {
        await fetch(`${BASE_URL}/${resource}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
    }

    static async logicalDelete(resource: string, id: string): Promise<void> {
        if (!confirm("Spostare nel cestino?")) return;

        try {
            await fetch(`${BASE_URL}/${resource}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: false })
            });
            alert("Elemento rimosso.");
        } catch (err) { alert("Errore durante l'eliminazione."); }
    }

    static async physicalDelete(resource: string, id: string): Promise<void> {
        if (!confirm("Sei sicuro di voler eliminare definitivamente questo elemento?" + "\n"
            + "Non sarà possibile tornare indietro."))
            return;

        try {
            await fetch(`${BASE_URL}/${resource}/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            alert("Elemento rimosso definitivamente.");
        } catch (err) { alert("Errore durante l'eliminazione."); }
    }

    static async restoreItem(resource: string, id: string): Promise<void> {
        try {
            await fetch(`${BASE_URL}/${resource}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: true })
            });
            alert("Elemento ripristinato.");
        } catch (err) { alert("Errore durante il ripristino."); }
    }
}