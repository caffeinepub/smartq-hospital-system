import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "patient" | "doctor";
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  role,
  redirectTo,
}: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to={
          redirectTo || (role === "doctor" ? "/doctor/login" : "/patient/login")
        }
        replace
      />
    );
  }

  if (role && user.userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
