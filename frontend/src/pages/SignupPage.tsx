import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { signup } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupFormSchema, type SignupFormValues } from "../validation/signup";
import {
  Alert, Box, Button, Card, CardContent,
  Container, Link, Stack, TextField, Typography,
} from "@mui/material";

export function SignupPage() {
  const nav = useNavigate();
  const { signinWithToken } = useAuth();

  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { email: "", username: "", password: "" },
    mode: "onTouched",
  });

  async function onSubmit(values: SignupFormValues) {
    setErr(null);
    setSubmitting(true);
    try {
      const res = await signup(values);
      await signinWithToken(res.accessToken);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.error?.code ?? "SIGNUP_FAILED");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="xs" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Sign up
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create an account to manage your tasks.
              </Typography>
            </Box>

            {err && <Alert severity="error">{err}</Alert>}

            <Stack component="form" onSubmit={form.handleSubmit(onSubmit)} spacing={2}>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                disabled={submitting}
                fullWidth
                {...form.register("email")}
                error={!!form.formState.errors.email}
                helperText={form.formState.errors.email?.message ?? " "}
              />

              <TextField
                label="Username"
                autoComplete="username"
                disabled={submitting}
                fullWidth
                {...form.register("username")}
                error={!!form.formState.errors.username}
                helperText={form.formState.errors.username?.message ?? " "}
              />

              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                disabled={submitting}
                fullWidth
                {...form.register("password")}
                error={!!form.formState.errors.password}
                helperText={
                  form.formState.errors.password?.message ??
                  "At least 8 chars, incl. letter, number, special char"
                }
              />

              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !form.formState.isValid}
              >
                {submitting ? "Creating..." : "Create account"}
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link component={RouterLink} to="/signin" underline="hover">
                Sign in
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
