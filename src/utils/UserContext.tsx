"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAuthenticatedUser } from "./getAuthUser";
import { AuthenticatedItem } from "./types";

interface UserContextType {
  user: AuthenticatedItem | undefined;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthenticatedItem | undefined>>;
}

const UserContext = createContext<UserContextType>({
  user: undefined,
  loading: true,
  refreshUser: async () => {},
  setUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedItem | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await getAuthenticatedUser();
      setUser(userData || undefined);
    } catch (error) {
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);