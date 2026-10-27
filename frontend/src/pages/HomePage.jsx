import ShortenerBox from "../features/url-shortener/components/ShortenerBox";
import ShortenedUrlsList from "../features/shortened-urls/components/ShortenedUrlsList";
import { useLinks } from "../features/shortened-urls/hooks/useLinks";
import Button from "../shared/components/Button";
import { useAuth } from "../features/auth/context/useAuth";

function HomePage() {
  const { logout } = useAuth();
  const { links, isLoading, error, addLink, clearError } = useLinks();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <ShortenerBox onLinkCreated={addLink} />
      <ShortenedUrlsList
        links={links}
        isLoading={isLoading}
        error={error}
        onDismissError={clearError}
      />
      <div className="w-full max-w-md">
        <Button variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>
    </div>
  );
}

export default HomePage;
