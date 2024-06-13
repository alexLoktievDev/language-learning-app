import type { FC, PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import Header from "@components/header/Header";
import { Box } from "@mui/material";

export const SuperAdminMainTemplate: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box height="100%">
      <Header />

      <Box
        sx={{
          paddingTop: "50px",
          height: "100%",
        }}
      >
        {children ? children : <Outlet />}
      </Box>
    </Box>
  );
};
