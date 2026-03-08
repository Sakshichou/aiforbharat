import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import {
  type AuthUser,
  type UserRole,
  getPersistedSession,
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  type SignInPayload,
  type SignUpPayload,
} from "@/services/authService";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (payload: SignInPayload) => Promise<{ success: boolean; error?: string }>;
  register: (payload: SignUpPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getPersistedSession();
    if (session?.user) setUser(session.user);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (payload: SignInPayload) => {
    const result = await authSignIn(payload);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  }, []);

  const register = useCallback(async (payload: SignUpPayload) => {
    const result = await authSignUp(payload);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await authSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role ?? null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
