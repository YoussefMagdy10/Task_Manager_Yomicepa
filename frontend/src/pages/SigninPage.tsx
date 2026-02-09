import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signin } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";

export function SigninPage() {
  const nav = useNavigate();
  const { signinWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await signin({ email, password });
      await signinWithToken(res.accessToken);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.error?.code ?? "SIGNIN_FAILED");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        <div style={{ height: 8 }} />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ height: 12 }} />
        <button type="submit">Sign in</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <p>
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
