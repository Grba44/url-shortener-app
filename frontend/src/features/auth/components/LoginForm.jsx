import { useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { HCAPTCHA_SITE_KEY, loginRequest } from "../api/api";
import { validateEmail, validateLoginPassword } from "../utils/validators";
import Card from "../../../shared/components/Card";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import FormError from "../../../shared/components/FormError";

const FIELDS = ["email", "password"];

function LoginForm({ onSuccess, onSwitchToSignUp }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [needsCaptcha, setNeedsCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaRef = useRef(null);

  // Mirrors what POST /auth/login actually checks: email format + lowercase,
  // and that a password was entered. Login never re-validates password
  // strength, so this is deliberately lighter than the signup form.
  const validate = () => {
    const errors = {};

    const emailError = validateEmail(values.email);
    if (emailError) errors.email = emailError;

    const passwordError = validateLoginPassword(values.password);
    if (passwordError) errors.password = passwordError;

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
      const data = await loginRequest({ ...values, captchaToken });
      await onSuccess?.(data);
    } catch (err) {
      if (err.response?.status === 429) {
        setNeedsCaptcha(true);
        setError("Too many attempts. Solve the CAPTCHA and try again.");
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
      } else {
        setError(err.response?.data?.message || "Login error.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl">
          👋
        </div>
        <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
        <p className="text-sm text-ink-muted">
          Log in to manage your shortened links.
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
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange("password")}
          onBlur={handleBlur("password")}
          error={fieldError("password")}
        />

        {needsCaptcha && (
          <div className="flex justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey={HCAPTCHA_SITE_KEY}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>
        )}

        <FormError>{error}</FormError>

        <Button type="submit" isLoading={isSubmitting}>
          Log in
        </Button>
      </form>

      {onSwitchToSignUp && (
        <p className="text-center text-sm text-ink-muted">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-medium text-primary hover:text-primary-hover cursor-pointer"
          >
            Sign up
          </button>
        </p>
      )}
    </Card>
  );
}

export default LoginForm;
