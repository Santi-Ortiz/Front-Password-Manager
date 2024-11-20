import { App } from "./app";
import { User } from "./user";

export interface Account {
    app: App
    user: User
    password: string
}