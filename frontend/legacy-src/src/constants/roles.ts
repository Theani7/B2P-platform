/** Shared role enum used across backend and frontend. */
export enum Role {
  BUSINESS = "BUSINESS",
  PROMOTER = "PROMOTER",
  ADMIN = "ADMIN",
}

export const RoleLabels: Record<Role, string> = {
  [Role.BUSINESS]: "Business",
  [Role.PROMOTER]: "Promoter",
  [Role.ADMIN]: "Admin",
};
