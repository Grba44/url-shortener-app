import { Navigate, createBrowserRouter } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import { ROUTES } from "./routes";
import HomePage from "../../pages/HomePage";
import LoginPage from "../../pages/LoginPage";
import SignUpPage from "../../pages/SignUpPage";

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    children: [{ path: ROUTES.HOME, element: <HomePage /> }],
  },
  {
    element: <GuestRoute />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.SIGNUP, element: <SignUpPage /> },
    ],
  },
  { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
]);
