function ErrorAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5"
    >
      <p className="text-sm text-red-600">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
      >
        OK
      </button>
    </div>
  );
}

export default ErrorAlert;
