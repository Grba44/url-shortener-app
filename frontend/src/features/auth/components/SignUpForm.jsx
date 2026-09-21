import { useState } from "react";
import { signupRequest } from "../api/api";
import {
  validateEmail,
  validatePassword,
  validatePasswordsMatch,
  validateUsername,
} from "../utils/validators";
import Card from "../../../shared/components/Card";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import FormError from "../../../shared/components/FormError";

function SignUpForm({ onSuccess, onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const usernameError = validateUsername(username);
    if (usernameError) errors.username = usernameError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validatePasswordsMatch(password, confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      const data = await signupRequest({ email, username, password });
      await onSuccess?.(data);
    } catch (err) {
      setError(err.response?.data?.message || "Sign up error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl">
          ✨
        </div>
        <h1 className="text-xl font-semibold text-ink">Create your account</h1>
        <p className="text-sm text-ink-muted">
          Sign up to start shortening and tracking your links.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <Input
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="yourname"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldErrors.username}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        <FormError>{error}</FormError>

        <Button type="submit" isLoading={isSubmitting}>
          Sign up
        </Button>
      </form>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-primary hover:text-primary-hover cursor-pointer"
          >
            Log in
          </button>
        </p>
      )}
    </Card>
  );
}

export default SignUpForm;
