import "./ProposeTab.css";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import SearchMusic from "../../components/SearchMusic";
import TrackList from "../../components/TrackList.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { normalizeTrack } from "../../utils/tracks.js";

// Écran « Proposer » de l'hôte : la recherche Spotify et la liste des
// morceaux de la soirée. Contrairement au wizard, chaque ajout est écrit en
// base tout de suite : la soirée existe déjà.
export default function ProposeTab() {
  const { playlist, playlistId } = useOutletContext();

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTracks() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/playlists/${playlistId}/tracks`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Impossible de charger les morceaux",
          );
        }

        if (!cancelled) setTracks(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTracks();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  // Le composant de recherche renvoie le résultat Spotify tel quel : on le
  // met au format attendu par l'API avant de l'envoyer.
  async function handleAddTrack(spotifyTrack) {
    setError("");

    const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizeTrack(spotifyTrack)),
    });

    const saved = await response.json();

    if (!response.ok) {
      throw new Error(
        saved.error || saved.message || "Impossible d'ajouter ce morceau",
      );
    }

    setTracks((previousTracks) => [saved, ...previousTracks]);
  }

  // Une soirée terminée n'accepte plus de morceau : le backend le refuse,
  // autant le dire avant que l'hôte essaie.
  const isClosed = playlist.status === "finished";

  return (
    <div className="propose-tab">
      <ExplanationText
        hasAppTitle={false}
        title="Propose des morceaux"
        text="Cherche dans le catalogue Spotify et ajoute les titres que tu veux voir passer. Tes invités peuvent faire la même chose depuis leur lien."
      />

      {isClosed ? (
        <p className="app-status" role="status">
          Cette soirée est terminée : on ne peut plus y ajouter de morceau.
        </p>
      ) : (
        <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />
      )}

      {loading && (
        <p className="app-status" role="status">
          Chargement des morceaux…
        </p>
      )}

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}

      <TrackList
        heading={`Morceaux de la soirée (${tracks.length})`}
        tracks={tracks}
        emptyText="Aucun morceau pour le moment. Ajoute le premier pour lancer l'ambiance."
      />
    </div>
  );
}
