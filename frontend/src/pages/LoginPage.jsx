import { useNavigate } from "react-router";
import LoginForm from "../features/auth/components/LoginForm";
import { useAuth } from "../features/auth/context/useAuth";
import { ROUTES } from "../shared/routes/routes";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <LoginForm
        onSuccess={login}
        onSwitchToSignUp={() => navigate(ROUTES.SIGNUP)}
      />
    </div>
  );
}

export default LoginPage;
