const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email) => {
  if (!email) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Invalid email.";
  return undefined;
};

const USERNAME_CHARSET_REGEX = /^[a-zA-Z0-9_-]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;

export const validateUsername = (username) => {
  if (!username || !username.trim()) return "Username is required.";
  if (
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters.`;
  }
  if (!USERNAME_CHARSET_REGEX.test(username)) {
    return "Username can only contain letters, numbers, underscores and hyphens.";
  }
  return undefined;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required.";

  const missing = [];
  if (password.length < 8) missing.push("be at least 8 characters");
  if (password.length >= 72) missing.push("be fewer than 72 characters");
  if (!/[A-Z]/.test(password)) missing.push("include an uppercase letter");
  if (!/[a-z]/.test(password)) missing.push("include a lowercase letter");
  if (!/\d/.test(password)) missing.push("include a digit");
  if (!/[^A-Za-z0-9]/.test(password)) missing.push("include a special character");

  if (missing.length === 0) return undefined;

  const list =
    missing.length === 1
      ? missing[0]
      : `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`;

  return `Password must ${list}.`;
};

export const validatePasswordsMatch = (password, confirmPassword) => {
  if (confirmPassword !== password) return "Passwords don't match.";
  return undefined;
};
