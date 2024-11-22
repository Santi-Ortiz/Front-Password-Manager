import { App } from "./app";
import { User } from "./user";

export interface Account {
    accountId: number
    app: App
    user: User | null
    usernameFromApp: string
    password: string
}
