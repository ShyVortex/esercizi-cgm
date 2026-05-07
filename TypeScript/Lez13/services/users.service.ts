import { ResponseJson } from "../types/response-json.js";
import { User } from "../types/user.js";
import { BASE_URL } from "../utilities/api.js";

export class UsersService {
    static async getAllUsers(): Promise<User[]> {
        const usersRes: Response = await fetch(`${BASE_URL}/users`);
        const users: ResponseJson = await usersRes.json();

        return (users.data || users) as User[];
    }
}