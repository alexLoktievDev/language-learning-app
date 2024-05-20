import { FC, memo } from "react";
import { RouteObject, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";

import { ROUTES } from "@helpers/routing";

import { UserRoleType } from "@types";
import { UseAuthType } from "@helpers";

const getAuthorizedRoutes = (role: UserRoleType | undefined): RouteObject[] => {
  switch (role) {
    case "admin":
      return ROUTES.admin;
    case "user":
      return ROUTES.authorised;

    default:
      return [];
  }
};

const RoutesCollection: FC<
  Pick<UseAuthType["user"], "authorized"> & {
    role?: UserRoleType;
  }
> = ({ authorized, role }) => {
  // User authorization status is pending
  if (authorized === null || (authorized && !role)) {
    return null;
  }

  // Determine routes based on authorization status and user role
  let routesToRender: RouteObject[] = ROUTES.publicRoutes;

  if (authorized) {
    const userRoutes = getAuthorizedRoutes(role);

    routesToRender = [...routesToRender, ...userRoutes];
  } else {
    routesToRender = [
      ...routesToRender,
      ...ROUTES.nonAuthorisedUsersOnlyRoutes,
    ];
  }
  // Return RouterProvider with determined routes
  return <RouterProvider router={createBrowserRouter(routesToRender)} />;
};

export const MemoizedRoutesCollection = memo(RoutesCollection);
