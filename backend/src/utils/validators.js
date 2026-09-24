export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return (
    typeof email === "string" &&
    regex.test(email) &&
    email === email.toLowerCase()
  );
};

export const isValidPassword = (password) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return (
    password.length >= 8 &&
    password.length < 72 &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    hasSpecial
  );
};

export const isValidUsername = (username) => {
  return typeof username === "string" && /^[a-zA-Z0-9_-]{3,20}$/.test(username);
};
