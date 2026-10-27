import { useState } from "react";
import Card from "../../../shared/components/Card";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";
import ErrorAlert from "../../../shared/components/ErrorAlert";
import { createLinkRequest } from "../api/api";

function ShortenerBox({ onLinkCreated }) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const data = await createLinkRequest({ originalUrl });
      onLinkCreated({ ...data.link, shortUrl: data.shortUrl });
      setOriginalUrl("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not shorten the link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl">
          🔗
        </div>
        <h1 className="text-xl font-semibold text-ink">Shorten your link</h1>
        <p className="text-sm text-ink-muted">
          Paste a URL below and get a clean, short link instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorAlert message={error} onDismiss={() => setError("")} />

        <Input
          type="text"
          placeholder="https://example.com/very/long/link"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
        />

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={!originalUrl.trim()}
        >
          Shorten URL
        </Button>
      </form>
    </Card>
  );
}

export default ShortenerBox;
