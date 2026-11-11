import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";

// /playlist/:id has no screen of its own: it sends the host to the right
// place depending on the playlist status.
export default function PlaylistEntry() {
  const { id } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaylist() {
      try {
        const response = await fetch(`/api/playlists/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger la soirée");
        }

        if (!cancelled) setPlaylist(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p>Chargement de la soirée…</p>;
  }

  if (!playlist) {
    return <p role="alert">{error || "Soirée introuvable"}</p>;
  }

  if (playlist.status === "active") {
    return <Navigate to={`/playlist/${id}/propose`} replace />;
  }

  if (playlist.status === "finished") {
    return <Navigate to={`/playlist/${id}/listen`} replace />;
  }

  // Preparing playlists resume at the first-tracks step.
  return <Navigate to={`/playlist/${id}/setup`} replace />;
}
