export type UserRole = "USER" | "AGENT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isPrivate?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
