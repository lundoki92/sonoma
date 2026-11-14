import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import SearchMusic from "../../components/SearchMusic";
import TrackList from "../../components/TrackList.jsx";
import { normalizeTrack } from "../../utils/tracks.js";
import {
  listHostTracks,
  addHostTrack,
  removeHostTrack,
} from "../../api/playlists.js";
import {
  listInvitationTracks,
  addInvitationTrack,
  removeInvitationTrack,
} from "../../api/invites.js";
import "./ProposeTab.css";

// Same screen as creation step 2, inside the party app: search, add a track
// and see the tracks already added to the party.
export default function ProposeTab() {
  const { role, playlist, code } = useOutletContext();

  const isGuest = role === "guest";
  const playlistId = playlist?.id;

  // Un seul point d'accès par rôle : les appels réseau sont déjà normalisés
  // dans src/api, l'écran ne choisit que la fonction qui va bien.
  // Les trois fonctions sont recréées à chaque rendu, elles ne portent aucun
  // état : les effets n'en dépendent pas.
  const listTracks = () =>
    isGuest ? listInvitationTracks(code) : listHostTracks(playlistId);

  const postTrack = (track) =>
    isGuest ? addInvitationTrack(code, track) : addHostTrack(playlistId, track);

  const deleteTrack = (trackId) =>
    isGuest
      ? removeInvitationTrack(code, trackId)
      : removeHostTrack(playlistId, trackId);

  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingKey, setRemovingKey] = useState(null);

  // The layout loads the playlist first: wait for it before fetching tracks.
  useEffect(() => {
    if (!playlist) return undefined;

    let cancelled = false;

    async function loadTracks() {
      setLoading(true);
      setError("");

      try {
        const data = await listTracks();

        if (!cancelled) setTracks(Array.isArray(data) ? data : []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist, isGuest, code, playlistId]);

  // Add a track to the party using the endpoint matching the role.
  // SearchMusic affiche l'échec sur le bouton : on le laisse remonter.
  async function handleAddTrack(spotifyTrack) {
    setError("");

    try {
      const track = await postTrack(normalizeTrack(spotifyTrack));

      setTracks((previousTracks) => [track, ...previousTracks]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Remove one of the current participant's own tracks.
  async function handleRemoveTrack(track) {
    const trackKey = track.id ?? track.external_track_id;

    setRemovingKey(trackKey);
    setError("");

    try {
      await deleteTrack(track.id);

      setTracks((previousTracks) =>
        previousTracks.filter((item) => item.id !== track.id),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingKey(null);
    }
  }

  return (
    <section className="propose-tab">
      <header className="propose-intro">
        <h2 className="propose-title">Proposer un morceau</h2>

        <p className="propose-text">
          {isGuest
            ? "Cherche dans le catalogue Spotify et propose un titre au vote."
            : "Ajoute un morceau à la soirée pour le soumettre au vote."}
        </p>
      </header>

      <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="app-status">Chargement des morceaux…</p>
      ) : (
        <TrackList
          heading={`Mes morceaux (${tracks.length})`}
          tracks={tracks}
          emptyText={
            isGuest
              ? "Tu n'as pas encore proposé de morceau."
              : "Tu n'as pas encore ajouté de morceau."
          }
          onRemove={handleRemoveTrack}
          removingKey={removingKey}
        />
      )}
    </section>
  );
}
