function ShortenerBox() {
  return (
    <div className="w-full max-w-md bg-surface rounded-3xl border border-border shadow-xl shadow-black/5 p-8 flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl">
          🔗
        </div>
        <h1 className="text-xl font-semibold text-ink">Shorten your link</h1>
        <p className="text-sm text-ink-muted">
          Paste a URL below and get a clean, short link instantly.
        </p>
      </div>

      <input
        type="text"
        placeholder="https://example.com/very/long/link"
        className="w-full rounded-2xl border border-border bg-canvas px-4 py-3 text-sm text-ink placeholder:text-ink-muted outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
      />

      <button className="w-full rounded-2xl bg-primary py-3 font-medium text-white transition-colors duration-200 hover:bg-primary-hover cursor-pointer">
        Shorten URL
      </button>
    </div>
  );
}

export default ShortenerBox;
