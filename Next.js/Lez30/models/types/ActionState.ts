import { User } from "./User";

export type ActionState = {
    success?: boolean;
    message?: string;
    errors?: { [key: string]: string };
    user?: User;
}
