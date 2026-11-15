import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import SearchMusic from "../../components/SearchMusic";
import TrackList from "../../components/TrackList.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { isOpeningTrack, normalizeTrack } from "../../utils/tracks.js";
import {
  getServiceIcon,
  getServiceLabel,
} from "../../utils/streamingServices.js";

// Écran « Proposer » de l'hôte. C'est le même écran que l'étape 2 du wizard
// de création : mêmes blocs, même ordre, même rythme vertical. La différence
// est le métier : la soirée existe déjà, donc les morceaux viennent de la
// base, ceux des invités sont dans la même liste, et chaque ajout ou retrait
// est écrit tout de suite.
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

  // Deux groupes, parce que deux histoires : ce que l'hôte a choisi en créant
  // la soirée est programmé, tout le reste est en train de voter. La règle est
  // dans utils/tracks.js pour que l'écran invité, plus tard, ne la réinvente
  // pas : chez lui, rien n'est jamais un morceau de lancement.
  const openingTracks = tracks.filter(isOpeningTrack);
  const proposalTracks = tracks.filter((track) => !isOpeningTrack(track));

  return (
    <div className="screen-column">
      <div className="screen-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Propose des morceaux"
          text="Cherche dans le catalogue Spotify et ajoute tes titres. Tes invités ajoutent les leurs de leur côté : tout le monde vote ensuite sur la même liste."
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

      {tracks.length === 0 && !loading ? (
        <TrackList
          heading="Tes morceaux"
          tracks={tracks}
          emptyText="Aucun morceau pour le moment. Ajoute le premier pour lancer l'ambiance."
        />
      ) : (
        <>
          {openingTracks.length > 0 && (
            <TrackList
              heading={`Le lancement de la soirée (${openingTracks.length})`}
              note="Choisis en créant la soirée : ils sont programmés, ni votés, ni retirables."
              tracks={openingTracks}
            />
          )}

          {proposalTracks.length > 0 && (
            <TrackList
              heading={`Tes propositions (${proposalTracks.length})`}
              note="Dès l'ajout, un morceau rejoint le vote de tout le monde : il ne se retire plus ici."
              tracks={proposalTracks}
            />
          )}
        </>
      )}
    </div>
  );
}
