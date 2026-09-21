import ShortenerBox from "../features/url-shortener/components/ShortenerBox";
import ShortenedUrlsList from "../features/shortened-urls/components/ShortenedUrlsList";
import Button from "../shared/components/Button";
import { useAuth } from "../features/auth/context/useAuth";

function HomePage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <ShortenerBox />
      <ShortenedUrlsList />
      <div className="w-full max-w-md">
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
