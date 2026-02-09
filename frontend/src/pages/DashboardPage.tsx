import { useAuth } from "../auth/AuthProvider";

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ maxWidth: 720, margin: "40px auto" }}>
      <h2>Welcome, {user?.username}</h2>
      <button onClick={logout}>Logout</button>

      <p style={{ marginTop: 16 }}>
        Next step: hook up Tasks list + create/edit/delete using React Query.
      </p>
    </div>
  );
}
