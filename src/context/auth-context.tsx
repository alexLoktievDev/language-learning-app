import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { removeAccessTokenFromLocalStorage } from "@helpers";
import { app } from "../helpers/hooks/use-firebase-config";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import { UserRoleType } from "@types";

// Define the user type and context type
export type UserType = {
  name: string;
};

export type AuthContextType = {
  authorized: boolean | null;
  login: () => void;
  defineAsUnauthorized: () => void;
  logout: () => void;
  user?: User & { role: UserRoleType };
};

// Create context with undefined for better handling when no provider is in place
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const auth = getAuth(app);

/**
 * Get the current user's role from custom claims
 * @returns {Promise<string | null>} - The user's role or null if not found
 */
async function getUserRole(): Promise<UserRoleType | null> {
  const user: User | null = auth.currentUser;

  console.log(2223333, auth.currentUser);

  if (user) {
    try {
      const idTokenResult = await user.getIdTokenResult(true); // Force refresh
      const claims = idTokenResult.claims;

      console.log(2222333222, claims);

      if (claims.admin) {
        return "admin";
      } else return "user";
    } catch (error) {
      console.error("Error retrieving custom claims:", error);
      return null;
    }
  } else {
    console.error("No user is signed in.");
    return null;
  }
}

export const AuthProvider = ({ children }: PropsWithChildren<{}>) => {
  const [user, setUser] = useState<(User & { role: UserRoleType }) | undefined>(
    undefined,
  );
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        getUserRole().then((role) => {
          console.log("User role:", role);
          if (auth.currentUser && role) setUser({ ...auth.currentUser, role });
          setAuthorized(true);
        });
      } else {
        setAuthorized(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
