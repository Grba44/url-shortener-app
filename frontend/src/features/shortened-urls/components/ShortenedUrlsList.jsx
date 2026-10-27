import Card from "../../../shared/components/Card";
import ErrorAlert from "../../../shared/components/ErrorAlert";

function ShortenedUrlsList({ links, isLoading, error, onDismissError }) {
  return (
    <Card className="gap-4">
      <h2 className="text-lg font-semibold text-ink">Your links</h2>

      <ErrorAlert message={error} onDismiss={onDismissError} />

      {isLoading && (
        <p className="py-6 text-center text-sm text-ink-muted">Loading…</p>
      )}

      {!isLoading && !error && links.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm text-ink-muted">No shortened links yet.</p>
        </div>
      )}

      {!isLoading && links.length > 0 && (
        <ul className="flex flex-col divide-y divide-border">
          {links.map((link) => (
            <li key={link.id} className="flex flex-col gap-1 py-3 min-w-0">
              <a
                href={link.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:text-primary-hover truncate"
              >
                {link.shortUrl}
              </a>
              <p
                className="text-sm text-ink-muted truncate"
                title={link.originalUrl}
              >
                {link.originalUrl}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default ShortenedUrlsList;
