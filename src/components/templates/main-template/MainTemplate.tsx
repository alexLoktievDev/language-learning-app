import type { FC, PropsWithChildren } from "react";
import { Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Stack,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { useAuth, useDisclosure } from "@helpers";
import { Chat } from "@components/chat";
import ChatIcon from "@mui/icons-material/Chat";
import LogoutIcon from "@mui/icons-material/Logout";
import TranslateIcon from "@mui/icons-material/Translate";
import Header from "@components/header/Header";

const StyledChatWrapper = styled("div")(() => ({
  position: "fixed",
  right: "30px",
  bottom: "30px",
}));

export const MainTemplate: FC<PropsWithChildren> = ({ children }) => {
  const { isOpen, open, close } = useDisclosure();

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

      {/*<StyledChatWrapper>*/}
      {/*  {!isOpen && (*/}
      {/*    <Button*/}
      {/*      variant="contained"*/}
      {/*      onClick={open}*/}
      {/*      sx={{*/}
      {/*        width: 60,*/}
      {/*        height: 60,*/}
      {/*        borderRadius: " 50%",*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <ChatIcon />*/}
      {/*    </Button>*/}
      {/*  )}*/}
      {/*  {isOpen && <Chat onCloseButtonClick={close} />}*/}
      {/*</StyledChatWrapper>*/}
    </Box>
  );
};
