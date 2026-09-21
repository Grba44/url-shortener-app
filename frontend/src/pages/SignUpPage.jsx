import { useNavigate } from "react-router";
import SignUpForm from "../features/auth/components/SignUpForm";
import { useAuth } from "../features/auth/context/useAuth";
import { ROUTES } from "../shared/routes/routes";

function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <SignUpForm
        onSuccess={login}
        onSwitchToLogin={() => navigate(ROUTES.LOGIN)}
      />
    </div>
  );
}

export default SignUpPage;
