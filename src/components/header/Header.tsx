import React from "react";
import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import TranslateIcon from "@mui/icons-material/Translate";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@helpers";

const Header = () => {
  const auth = useAuth();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Stack
        direction="row"
        justifyContent="flex-end"
        component={AppBar}
        sx={{
          background: "transparent",
        }}
        position="static"
      >
        <Toolbar
          style={{
            width: "100%",
          }}
        >
          <Stack
            style={{
              width: "100%",
            }}
            direction="row"
            justifyContent="space-between"
          >
            <Stack
              component={Typography}
              direction="row"
              alignItems="center"
              gap={1}
              variant="subtitle1"
              sx={{
                color: "#1F8DFB",
              }}
            >
              <TranslateIcon />
              App Logo
            </Stack>

            <Button onClick={auth?.logout} endIcon={<LogoutIcon />}>
              Sign Out
            </Button>
          </Stack>
        </Toolbar>
      </Stack>
    </Box>
  );
};

export default Header;
