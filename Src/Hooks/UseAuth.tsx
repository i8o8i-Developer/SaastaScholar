import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, getAccessToken, removeAccessToken, setAccessToken, StudentUser, toTitleCase } from "@/Lib/Api";
import { toast } from "sonner";

interface AuthContextType {
  user: StudentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: Partial<StudentUser> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<StudentUser>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(() => {
    const saved = localStorage.getItem("nimswallah_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      if (!getAccessToken()) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await apiFetch<StudentUser>("/auth/me/");
      setUser(userData);
      localStorage.setItem("nimswallah_user", JSON.stringify(userData));
    } catch (err) {
      removeAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password = "password123"): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await apiFetch<{ user: StudentUser; access: string; refresh: string }>("/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setAccessToken(res.access);
      if (res.refresh) {
        localStorage.setItem("nimswallah_refresh_token", res.refresh);
      }
      setUser(res.user);
      localStorage.setItem("nimswallah_user", JSON.stringify(res.user));
      const userName = toTitleCase(res.user.full_name || res.user.username || "Scholar");
      toast.success(`Welcome Back, ${userName}!`);
      return true;
    } catch (error: any) {
      toast.error(toTitleCase(error.message || "Authentication Failed. Please Verify Credentials."));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Partial<StudentUser> & { password?: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await apiFetch<{ user: StudentUser; access: string; refresh: string }>("/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          password: data.password || "password123",
        }),
      });

      setAccessToken(res.access);
      if (res.refresh) {
        localStorage.setItem("nimswallah_refresh_token", res.refresh);
      }
      setUser(res.user);
      localStorage.setItem("nimswallah_user", JSON.stringify(res.user));
      toast.success("Welcome To NimsWallah! Student Profile Registered Successfully.");
      return true;
    } catch (error: any) {
      toast.error(toTitleCase(error.message || "Registration Failed. Please Check Provided Details."));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<StudentUser>): Promise<boolean> => {
    try {
      const updated = await apiFetch<StudentUser>("/auth/me/", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      setUser(updated);
      localStorage.setItem("nimswallah_user", JSON.stringify(updated));
      toast.success("Academic Profile Details Updated Successfully.");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed To Update Profile.");
      return false;
    }
  };

  const logout = () => {
    removeAccessToken();
    setUser(null);
    toast.info("You Have Been Signed Out Of Workspace.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
