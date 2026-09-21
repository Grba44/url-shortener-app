import Card from "../../../shared/components/Card";
import Input from "../../../shared/components/Input";
import Button from "../../../shared/components/Button";

function ShortenerBox() {
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

      <Input type="text" placeholder="https://example.com/very/long/link" />

      <Button>Shorten URL</Button>
    </Card>
  );
}

export default ShortenerBox;
