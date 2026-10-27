import { useEffect, useState } from "react";
import { getLinksRequest } from "../api/api";

// Owns the user's link list so both the shortener (adds) and the list (reads)
// can share it through HomePage.
export function useLinks() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Abort on unmount so Strict Mode's double-invoked effect can't set stale state
    const controller = new AbortController();

    const loadLinks = async () => {
      try {
        const data = await getLinksRequest({ signal: controller.signal });
        setLinks(data.links);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.message || "Could not load your links.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadLinks();

    return () => controller.abort();
  }, []);

  const addLink = (link) => setLinks((prev) => [link, ...prev]);
  const clearError = () => setError("");

  return { links, isLoading, error, addLink, clearError };
}
