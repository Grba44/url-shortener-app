import { useId } from "react";

function Input({ label, error, type = "text", className = "", id, ref, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        type={type}
        className={`w-full rounded-2xl border bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-muted outline-none transition focus:ring-4 ${
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-400/15"
            : "border-border focus:border-primary focus:ring-primary/15"
        } ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
