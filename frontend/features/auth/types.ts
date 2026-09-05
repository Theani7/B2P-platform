import { Role } from "@/lib/roles";

export interface User {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
  promoterProfile?: { id: string; username: string; niche?: string; avatarUrl?: string | null } | null;
  businessProfile?: { id: string; companyName?: string; logoUrl?: string | null } | null;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}
