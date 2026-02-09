import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { signin } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export function SigninPage() {
  const nav = useNavigate();
  const { signinWithToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const res = await signin({ email, password });
      await signinWithToken(res.accessToken);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.error?.code ?? "SIGNIN_FAILED");
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
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back. Enter your credentials to continue.
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
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !email.trim() || !password}
              >
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              No account?{" "}
              <Link component={RouterLink} to="/signup" underline="hover">
                Sign up
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
