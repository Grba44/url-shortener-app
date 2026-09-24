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

const FIELDS = ["email", "username", "password", "confirmPassword"];

function SignUpForm({ onSuccess, onSwitchToLogin }) {
  const [values, setValues] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errors = {};

    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;

    const usernameError = validateUsername(values.username);
    if (usernameError) errors.username = usernameError;

    const passwordError = validatePassword(values.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validatePasswordsMatch(
      values.password,
      values.confirmPassword,
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    return errors;
  };

  const errors = validate();

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const fieldError = (field) => (touched[field] ? errors[field] : undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched(Object.fromEntries(FIELDS.map((field) => [field, true])));

    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      const data = await signupRequest(values);
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
          value={values.email}
          onChange={handleChange("email")}
          onBlur={handleBlur("email")}
          error={fieldError("email")}
        />

        <Input
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="yourname"
          value={values.username}
          onChange={handleChange("username")}
          onBlur={handleBlur("username")}
          error={fieldError("username")}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          error={fieldError("password")}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={handleChange("confirmPassword")}
          onBlur={handleBlur("confirmPassword")}
          error={fieldError("confirmPassword")}
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
