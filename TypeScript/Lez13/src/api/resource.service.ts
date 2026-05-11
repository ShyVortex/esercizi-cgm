import { BaseApiService } from "./base-api.service.js";

class ResourceService extends BaseApiService<any> {
    private _resource: string = "";

    protected get resource(): string {
        return this._resource;
    }

    private setResource(res: string): void {
        this._resource = res;
    }

    public async fetchResource(resource: string, params: string = ''): Promise<any> {
        this.setResource(resource);
        return this.getAll(params);
    }

    public async getItem(resource: string, id: string | number): Promise<any> {
        this.setResource(resource);
        return this.getById(id);
    }

    public async createItem(resource: string, data: Record<string, any>): Promise<any> {
        this.setResource(resource);
        return this.create(data);
    }

    public async updateItem(resource: string, id: string | number, data: Record<string, any>): Promise<any> {
        this.setResource(resource);
        return this.update(id, data);
    }

    public async physicalDelete(resource: string, id: string | number): Promise<void> {
        this.setResource(resource);
        return this.delete(id);
    }

    public async logicalDelete(resource: string, id: string | number): Promise<any> {
        this.setResource(resource);
        return this.update(id, { isActive: false });
    }

    public async restoreItem(resource: string, id: string | number): Promise<any> {
        this.setResource(resource);
        return this.update(id, { isActive: true });
    }
}

export const resourceService = new ResourceService();
