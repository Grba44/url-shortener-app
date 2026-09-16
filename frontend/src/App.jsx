import ShortenerBox from "./features/url-shortener/components/ShortenerBox";
import ShortenedUrlsList from "./features/shortened-urls/components/ShortenedUrlsList";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <ShortenerBox />
      <ShortenedUrlsList />
    </div>
  );
}

export default App;
