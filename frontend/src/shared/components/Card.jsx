function Card({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-md bg-surface rounded-3xl border border-border shadow-xl shadow-black/5 p-8 flex flex-col gap-6 ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
