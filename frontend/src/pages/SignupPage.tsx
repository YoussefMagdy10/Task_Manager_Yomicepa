import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/auth";
import { useAuth } from "../auth/AuthProvider";

export function SignupPage() {
  const nav = useNavigate();
  const { signinWithToken } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const res = await signup({ email, username, password });
      await signinWithToken(res.accessToken);
      nav("/app");
    } catch (e: any) {
      setErr(e?.response?.data?.error?.code ?? "SIGNUP_FAILED");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Sign up</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%" }} />
        <div style={{ height: 8 }} />
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ height: 8 }} />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%" }}
        />
        <div style={{ height: 12 }} />
        <button type="submit">Create account</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      <p>
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </div>
  );
}
