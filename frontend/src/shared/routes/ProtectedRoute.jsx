import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../features/auth/context/useAuth";
import FullPageLoader from "../components/FullPageLoader";
import { ROUTES } from "./routes";

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return <Outlet />;
}

export default ProtectedRoute;
