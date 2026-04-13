"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getUserProfile, touchLastLogin } from "@/lib/services/user-service";
import type { UserProfile } from "@/types/models";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => undefined
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const nextAuth = getFirebaseAuth();
    if (!nextAuth.currentUser) {
      setProfile(null);
      return;
    }
    const next = await getUserProfile(nextAuth.currentUser.uid);
    setProfile(next);
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const nextProfile = await getUserProfile(nextUser.uid);
      setProfile(nextProfile);
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
      refreshProfile
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
