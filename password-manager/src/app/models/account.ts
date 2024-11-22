import { App } from "./app";
import { User } from "./user";

export interface Account {
    id: number
    app: App
    user: User | null
    usernameFromApp: string
    password: string
}
