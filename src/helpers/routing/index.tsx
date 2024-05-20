import { Navigate, RouteObject } from "react-router";

import {
  SignIn,
  Categories,
  SubCategories,
  ResetPassword,
  Dashboard,
  NotFound,
} from "@components/pages";
import { MainTemplate } from "@components/templates";
import { SuperAdminMainTemplate } from "@components/templates/super-admin-main-template";

import { ProtectedRoute } from "@helpers/hocs/protected-route/ProtectedRoute";

// Menu Items
export const userNavigationItems: (RouteObject & {
  name: string;
})[] = [
  {
    name: "Categories",
    path: "categories",
    element: <Categories />,
    children: [
      {
        path: ":categoryId",
        element: <SubCategories />,
      },
    ],
  },
];

// Routes
export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
];

export const nonAuthorisedUsersOnlyRoutes: RouteObject[] = [
  {
    path: "*",
    element: <Navigate to="/sign-in" />,
  },
  {
    path: "/sign-in",
    element: (
      <ProtectedRoute redirectPath="/dashboard">
        <SignIn />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <ProtectedRoute redirectPath="/dashboard">
        <ResetPassword />
      </ProtectedRoute>
    ),
  },
];

const authorisedCommonRoutes: RouteObject[] = [
  {
    path: "*",
    element: (
      <MainTemplate>
        <NotFound />
      </MainTemplate>
    ),
  },
  {
    path: "/sign-in",
    element: <Navigate to="/" />,
  },
];

export const authorisedAdminOnlyRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Navigate to="/dashboard/1" />,
  },
  {
    path: "/dashboard/:page",
    element: (
      <ProtectedRoute privateRoute redirectPath="/sign-in">
        <SuperAdminMainTemplate>
          <Dashboard />
        </SuperAdminMainTemplate>
      </ProtectedRoute>
    ),
  },
  ...authorisedCommonRoutes,
];
export const authorisedOnlyRoutes: RouteObject[] = [
  ...authorisedCommonRoutes,
  {
    path: "/dashboard",
    element: <Navigate to="/dashboard/categories" replace />,
  },
  {
    path: "/dashboard/*",
    element: (
      <ProtectedRoute privateRoute redirectPath="/sign-in">
        <MainTemplate />
      </ProtectedRoute>
    ),
    children: userNavigationItems,
  },
];

export const ROUTES: { [key: string]: RouteObject[] } = {
  authorisedCommonRoutes,
  publicRoutes,
  nonAuthorisedUsersOnlyRoutes,
  admin: authorisedAdminOnlyRoutes,
  authorised: authorisedOnlyRoutes,
};
