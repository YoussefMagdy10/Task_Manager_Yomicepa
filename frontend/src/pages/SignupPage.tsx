import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { signup } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";
import {
  Alert, Box, Button, Card, CardContent,
  Container, Link, Stack, TextField, Typography,
} from "@mui/material";

export function SignupPage() {
  const nav = useNavigate();
  const { signinWithToken } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // (your backend uses username)
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await signup({ email, username, password });
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

            <Stack component="form" onSubmit={onSubmit} spacing={2}>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                fullWidth
              />

              <TextField
                label="Username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                fullWidth
                helperText="Minimum 8 characters"
              />

              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !email.trim() || !username.trim() || !password}
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
