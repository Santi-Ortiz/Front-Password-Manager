import {Role} from "./role";


export class Auth {
  accessToken: string;
  username: string;
  role: Role;
  userId: number;

  constructor(accessToken: string, username: string, role: Role, userId: number) {
    this.accessToken = accessToken;
    this.username = username;
    this.role = role;
    this.userId = userId;
  }
}
