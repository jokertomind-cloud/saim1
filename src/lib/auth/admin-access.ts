import type { ParsedToken } from "firebase/auth";
import type { UserProfile } from "@/types/models";

export type AdminAccessSource = "custom-claims" | "firestore-role" | "none";

export interface AdminAccess {
  canAccessAdmin: boolean;
  source: AdminAccessSource;
  hasCustomClaim: boolean;
  firestoreRole: UserProfile["role"] | null;
}

const hasAdminClaim = (claims: ParsedToken | null | undefined) => claims?.admin === true;

export const resolveAdminAccess = (profile: UserProfile | null, claims?: ParsedToken | null): AdminAccess => {
  if (hasAdminClaim(claims)) {
    return {
      canAccessAdmin: true,
      source: "custom-claims",
      hasCustomClaim: true,
      firestoreRole: profile?.role ?? null
    };
  }

  if (profile?.role === "admin") {
    return {
      canAccessAdmin: true,
      source: "firestore-role",
      hasCustomClaim: false,
      firestoreRole: profile.role
    };
  }

  return {
    canAccessAdmin: false,
    source: "none",
    hasCustomClaim: false,
    firestoreRole: profile?.role ?? null
  };
};
