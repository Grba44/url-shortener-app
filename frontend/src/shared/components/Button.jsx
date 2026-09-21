const VARIANT_CLASSES = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary:
    "bg-canvas text-ink border border-border hover:bg-border/60",
};

function Button({
  children,
  type = "button",
  variant = "primary",
  isLoading = false,
  disabled = false,
  className = "",
  ref,
  ...props
}) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`w-full rounded-2xl py-3 font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}

export default Button;
