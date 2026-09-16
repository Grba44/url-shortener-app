function ShortenedUrlsList() {
  return (
    <div className="w-full max-w-md bg-surface rounded-3xl border border-border shadow-xl shadow-black/5 p-8 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-ink">Your links</h2>

      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-sm text-ink-muted">No shortened links yet.</p>
      </div>
    </div>
  );
}

export default ShortenedUrlsList;
