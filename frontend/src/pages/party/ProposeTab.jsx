import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import SearchMusic from "../../components/SearchMusic";
import TrackList from "../../components/TrackList.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { normalizeTrack } from "../../utils/tracks.js";
import {
  getServiceIcon,
  getServiceLabel,
} from "../../utils/streamingServices.js";

// Écran « Proposer » de l'hôte. C'est le même écran que l'étape 2 du wizard
// de création : mêmes blocs, même ordre, même rythme vertical. La seule
// différence est le métier : ici la soirée existe déjà, donc chaque ajout est
// écrit en base tout de suite au lieu de rester en mémoire.
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
    <div className="screen-column">
      <div className="screen-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Propose des morceaux"
          text="Cherche dans le catalogue Spotify et ajoute les titres que tu veux voir passer. Tes invités peuvent faire la même chose depuis leur lien."
        />
      </div>

      <div className="app-meta-row">
        <span className="app-chip">
          <i className="fa-solid fa-compact-disc" aria-hidden="true"></i>
          {playlist.name}
        </span>

        <span className="app-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(playlist.date_time).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        <span className="app-chip">
          <i
            className={getServiceIcon(playlist.streaming_service)}
            aria-hidden="true"
          ></i>
          {getServiceLabel(playlist.streaming_service)}
        </span>
      </div>

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
