import { useContext } from "react";
import { AuthContext, AuthContextType } from "../../context";

export type UseAuthType = {
  user: {
    authorized: boolean | undefined | null;
  };
};

export const useAuth = (): AuthContextType | undefined => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
