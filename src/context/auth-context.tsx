import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { removeAccessTokenFromLocalStorage } from "@helpers";

// Define the user type and context type
export type UserType = {
  name: string;
};

export type AuthContextType = {
  authorized: boolean | null;
  login: () => void;
  defineAsUnauthorized: () => void;
  logout: () => void;
  user?: UserType;
};

// Create context with undefined for better handling when no provider is in place
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<UserType | undefined>(undefined);
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  const defineAsUnauthorized = () => {
    setAuthorized(false);
  };
  const login = () => {
    setAuthorized(true);
  };

  const logout = () => {
    setUser(undefined);
    setAuthorized(false);
    removeAccessTokenFromLocalStorage();
  };

  return (
    <AuthContext.Provider
      value={{ authorized, user, defineAsUnauthorized, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
