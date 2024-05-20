import { FC, useState } from "react";
import {
  Backdrop,
  Button,
  CircularProgress,
  FilledInput,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";
import { loginWithEmailPassword, useAuth } from "@helpers";
import { AuthError } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { enqueueSnackbar } from "notistack";

type SignInFormValues = {
  email: string;
  password: string;
};

const SignInForm: FC = () => {
  const { t } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>();

  const auth = useAuth();

  const mutation = useMutation({
    mutationFn: (data: SignInFormValues) =>
      loginWithEmailPassword(data, auth?.login),
    onSuccess: (data) => {
      console.log("Success", data);
    },
    onError: (error) => {
      enqueueSnackbar(t(`errors.${(error as AuthError).code}`), {
        variant: "error",
      });
      console.log("onError", (error as AuthError).code);
    },
  });

  const onFormSubmit = (data: SignInFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={mutation.isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Stack direction="column" spacing={1} minWidth={350}>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          autoFocus
          {...register("email")}
        />

        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>

        <Button type="submit" variant="contained">
          Sign in
        </Button>
      </Stack>
    </form>
  );
};

export default SignInForm;
