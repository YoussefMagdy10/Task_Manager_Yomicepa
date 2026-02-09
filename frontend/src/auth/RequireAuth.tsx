import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { JSX } from "react";

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, booting } = useAuth();

  if (booting) return <div>Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;

  return children;
}
