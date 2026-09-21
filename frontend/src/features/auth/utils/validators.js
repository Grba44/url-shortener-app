const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Invalid email.";
  return undefined;
};

export const validateUsername = (username) => {
  if (!username) return "Username is required.";
  return undefined;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length >= 72) return "Password must be less than 72 characters.";

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return "Password needs an uppercase letter, a lowercase letter, a digit and a special character.";
  }

  return undefined;
};

export const validatePasswordsMatch = (password, confirmPassword) => {
  if (confirmPassword !== password) return "Passwords don't match.";
  return undefined;
};
