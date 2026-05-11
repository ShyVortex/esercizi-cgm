import { User } from "../shared/types/user.js";
import { BaseApiService } from "./base-api.service.js";

class UsersService extends BaseApiService<User> {
    protected resource = "users";

    public async getActiveUsers(): Promise<User[]> {
        return this.getAll("?isActive=true");
    }
}

export const usersService = new UsersService();
