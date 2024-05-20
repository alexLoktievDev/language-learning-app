import type { FC, PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";

export const SuperAdminMainTemplate: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div>
      {children} <Outlet />
    </div>
  );
};
