import React from "react";
import { Button, Stack, Typography, Container } from "@mui/material";
import { loginWithGoogle, useAuth } from "@helpers";
import GoogleIcon from "@mui/icons-material/Google";
import SignInForm from "@components/forms/sign-in-form/SignInForm";

export const SignIn = () => {
  const auth = useAuth();

  return (
    <Container
      sx={{
        height: "100vh",
      }}
    >
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        spacing={2}
      >
        <Typography variant="h4">SignIn</Typography>

        <SignInForm />

        <Stack direction="row" alignItems="center" justifyContent="center">
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => loginWithGoogle(auth?.login)}
          >
            Sign in with Google
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
