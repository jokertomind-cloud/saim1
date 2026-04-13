"use client";

import { getIdTokenResult, onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { resolveAdminAccess, type AdminAccess } from "@/lib/auth/admin-access";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getUserProfile, touchLastLogin } from "@/lib/services/user-service";
import type { UserProfile } from "@/types/models";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  adminAccess: AdminAccess;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  adminAccess: resolveAdminAccess(null, null),
  refreshProfile: async () => undefined
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminAccess, setAdminAccess] = useState<AdminAccess>(resolveAdminAccess(null, null));
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const nextAuth = getFirebaseAuth();
    if (!nextAuth.currentUser) {
      setProfile(null);
      setAdminAccess(resolveAdminAccess(null, null));
      return;
    }
    const [next, tokenResult] = await Promise.all([
      getUserProfile(nextAuth.currentUser.uid),
      getIdTokenResult(nextAuth.currentUser)
    ]);
    setProfile(next);
    setAdminAccess(resolveAdminAccess(next, tokenResult.claims));
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setAdminAccess(resolveAdminAccess(null, null));
        setLoading(false);
        return;
      }
      const [nextProfile, tokenResult] = await Promise.all([getUserProfile(nextUser.uid), getIdTokenResult(nextUser)]);
      setProfile(nextProfile);
      setAdminAccess(resolveAdminAccess(nextProfile, tokenResult.claims));
      await touchLastLogin(nextUser.uid).catch(() => undefined);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
        user,
        profile,
        loading,
        adminAccess,
        refreshProfile
      }),
    [user, profile, loading, adminAccess]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
