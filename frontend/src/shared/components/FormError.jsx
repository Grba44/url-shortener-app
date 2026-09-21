function FormError({ children }) {
  if (!children) return null;

  return (
    <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
      {children}
    </p>
  );
}

export default FormError;
