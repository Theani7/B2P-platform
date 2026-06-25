export interface RegisterPayload {
  username: string;
  full_name: string;
  email: string;
  password: string;
  role: "BUSINESS" | "PROMOTER";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: "BUSINESS" | "PROMOTER" | "ADMIN";
  is_active: boolean;
  is_verified: boolean;
  has_profile: boolean;
  created_at: string;
  updated_at: string;
}
