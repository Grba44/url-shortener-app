import Card from "../../../shared/components/Card";

function ShortenedUrlsList() {
  return (
    <Card className="gap-4">
      <h2 className="text-lg font-semibold text-ink">Your links</h2>

      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-sm text-ink-muted">No shortened links yet.</p>
      </div>
    </Card>
  );
}

export default ShortenedUrlsList;
