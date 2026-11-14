import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import { getPlaylist } from "../api/playlists.js";

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
        const data = await getPlaylist(id);

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
    return <p className="app-status">Chargement de la soirée…</p>;
  }

  if (!playlist) {
    return (
      <p className="app-error" role="alert">
        {error || "Soirée introuvable"}
      </p>
    );
  }

  if (playlist.status === "finished") {
    return <Navigate to={`/playlist/${id}/listen`} replace />;
  }

  // Une soirée ouverte s'ouvre dans l'application, que son heure soit passée
  // ou dans trois jours : c'est l'hôte qui a décidé de l'ouvrir.
  if (playlist.status === "active") {
    return <Navigate to={`/playlist/${id}/propose`} replace />;
  }

  // Un reste de l'ancien système de brouillon reprend à l'étape 1.
  return <Navigate to={`/playlist/${id}/edit`} replace />;
}
