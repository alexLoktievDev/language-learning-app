import { FC, memo, PropsWithChildren, ReactElement } from "react";
import { Navigate } from "react-router";

import { useAuth } from "@helpers/hooks";

interface ProtectedRouteInterface extends PropsWithChildren {
  redirectPath: string;
  privateRoute?: boolean;
}

const _ProtectedRoute: FC<ProtectedRouteInterface> = ({
  children,
  privateRoute,
  redirectPath,
}) => {
  const auth = useAuth();

  if (privateRoute ? !auth?.authorized : auth?.authorized) {
    return <Navigate to={redirectPath} />;
  }
  console.log(333333, children);

  return children as ReactElement;
};

export const ProtectedRoute = memo(_ProtectedRoute);
