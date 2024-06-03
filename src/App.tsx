import React, { useEffect } from "react";
import { getFirestore } from "firebase/firestore";
import "./App.css";
import { Button, createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { Chat } from "./components";
import { useFirebaseConfig } from "./helpers/hooks/use-firebase-config";
import { getAccessTokenFromLocalStorage, useAuth } from "@helpers";
import { MemoizedRoutesCollection } from "@helpers/hocs/routes-collection";
import { QueryClient, QueryClientProvider } from "react-query";
import { initI18n } from "@helpers/configs";
import { SnackbarProvider } from "notistack";
import { AuthProvider } from "./context";

// TODO:Isolate

const theme = createTheme({
  components: {
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "4px",

          ".MuiLinearProgress-bar": {
            background: "yellow",
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          background: "#F5F9FD",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },

          color: "#FFF",
          path: {
            color: "#FFF",
          },
        },
      },
    },

    // Global CSS overrides
    MuiCssBaseline: {
      styleOverrides: `
        .rce-mbox {
        padding: 6px 10px 40px !important;
        }
      `,
    },
  },
});

function App() {
  initI18n();
  const queryClient = new QueryClient();

  useFirebaseConfig();
  const auth = useAuth();

  const accessToken = getAccessTokenFromLocalStorage();

  useEffect(() => {
    if (!auth?.authorized && accessToken) {
      auth?.login?.();
    } else if (!auth?.authorized && !accessToken) {
      auth?.defineAsUnauthorized();
    }
  }, [accessToken, auth, auth?.authorized]);

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <CssBaseline />
        <SnackbarProvider
          autoHideDuration={4000}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        />

        <div className="App">
          <MemoizedRoutesCollection authorized={auth?.authorized} role="user" />
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
