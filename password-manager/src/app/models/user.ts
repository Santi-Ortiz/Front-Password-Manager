import { Account } from "../models/account"

export interface User {
    id: number
    username: string
    password: string
    email: string
    role: string
    accounts: Account[]
    
}