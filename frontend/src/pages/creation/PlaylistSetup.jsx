import { useEffect, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import SearchMusic from "../../components/SearchMusic";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { getServiceIcon, getServiceLabel } from "./services.js";
import {
  clearPlaylistDraft,
  readPlaylistDraft,
  savePlaylistDraft,
} from "./draft.js";
import "./PlaylistSetup.css";

// Turn a Spotify search result into the payload expected by the API.
function normalizeTrack(track) {
  const externalId = track.spotifyId ?? track.external_track_id;

  const artist = track.artist
    ? track.artist
    : Array.isArray(track.artists)
      ? track.artists.map((item) => item.name).join(", ")
      : "";

  return {
    external_track_id: externalId,
    spotify_uri:
      track.uri ??
      track.spotify_uri ??
      (externalId ? `spotify:track:${externalId}` : null),
    title: track.title ?? track.name,
    artist,
    image_url: track.cover ?? track.image_url ?? null,
    duration_ms: track.durationMs ?? track.duration_ms,
  };
}

export default function PlaylistSetup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Without an ID, the playlist is still a client-side draft. With an ID,
  // this screen edits an existing playlist stored in the database.
  const isDraft = !id;

  const [storedDraft] = useState(() =>
    isDraft ? readPlaylistDraft() : null,
  );
  const draft = location.state?.draft ?? storedDraft?.draft;
  const initialTracks =
    location.state?.tracks ?? storedDraft?.tracks ?? [];

  const [playlist, setPlaylist] = useState(() => {
    if (!isDraft || !draft) return null;

    return {
      name: draft.name,
      date_time: draft.date_time,
      streaming_service: draft.streaming_service,
    };
  });
  const [tracks, setTracks] = useState(isDraft ? initialTracks : []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isDraft);
  const [removingKey, setRemovingKey] = useState(null);
  const [creating, setCreating] = useState(false);

  // Keep the temporary draft in sync so the header back button can restore
  // both the form and the chosen tracks.
  useEffect(() => {
    if (!isDraft || !draft) return;

    savePlaylistDraft({ draft, tracks });
  }, [isDraft, draft, tracks]);

  // Existing playlist: load its data and host tracks from the API.
  useEffect(() => {
    if (isDraft) return undefined;

    let cancelled = false;

    async function fetchPlaylist() {
      try {
        const [playlistResponse, tracksResponse] = await Promise.all([
          fetch(`/api/playlists/${id}`),
          fetch(`/api/playlists/${id}/tracks`),
        ]);

        if (!playlistResponse.ok || !tracksResponse.ok) {
          throw new Error("Impossible de charger la soirée");
        }

        const playlistData = await playlistResponse.json();
        const tracksData = await tracksResponse.json();

        if (!cancelled) {
          setPlaylist(playlistData);
          setTracks(Array.isArray(tracksData) ? tracksData : []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlaylist();

    return () => {
      cancelled = true;
    };
  }, [id, isDraft]);

  // Save a Spotify track: locally while the playlist is a draft, directly
  // in the database once the playlist exists.
  async function handleAddTrack(spotifyTrack) {
    const normalized = normalizeTrack(spotifyTrack);

    if (isDraft) {
      setTracks((previousTracks) => {
        const alreadyAdded = previousTracks.some(
          (track) =>
            track.external_track_id === normalized.external_track_id,
        );

        return alreadyAdded ? previousTracks : [normalized, ...previousTracks];
      });

      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/playlists/${id}/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(normalized),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'ajouter le morceau");
      }

      setTracks((previousTracks) => [data, ...previousTracks]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Remove a track: locally for a draft, through the API for a saved playlist.
  async function handleRemoveTrack(track) {
    const trackKey = track.id ?? track.external_track_id;

    if (isDraft) {
      setTracks((previousTracks) =>
        previousTracks.filter(
          (item) =>
            (item.id ?? item.external_track_id) !== trackKey,
        ),
      );

      return;
    }

    setRemovingKey(trackKey);
    setError("");

    try {
      const response = await fetch(
        `/api/playlists/${id}/tracks/${track.id}`,
        { method: "DELETE" },
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Impossible de retirer le morceau");
      }

      setTracks((previousTracks) =>
        previousTracks.filter((item) => item.id !== track.id),
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingKey(null);
    }
  }

  // Validate step 2: this is where the playlist and its tracks are actually
  // created in the database.
  async function handleNext() {
    if (!isDraft) {
      navigate(`/playlist/${id}/share`);
      return;
    }

    if (!draft) return;

    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...draft,
          tracks: tracks.map(normalizeTrack),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la soirée");
      }

      clearPlaylistDraft();
      navigate(`/playlist/${data.id}/share`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (isDraft && !draft) {
    return <Navigate to="/createplaylist" replace />;
  }

  if (loading) {
    return <p className="creation-status">Chargement de la soirée…</p>;
  }

  if (!playlist) {
    return (
      <p className="creation-status">{error || "Soirée introuvable"}</p>
    );
  }

  return (
    <div className="setup-step">
      <div className="creation-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Ajoute les premiers morceaux"
          text="Recherche dans le catalogue Spotify et prépare l'ambiance de ta soirée."
        />
      </div>

      <div className="setup-playlist-meta">
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

      <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />

      {error && (
        <p className="creation-error" role="alert">
          {error}
        </p>
      )}

      <section className="setup-section">
        <h2>Morceaux de la soirée ({tracks.length})</h2>

        {tracks.length === 0 ? (
          <p className="setup-empty">
            Aucun morceau pour le moment. Tu pourras en ajouter plus tard,
            depuis l'app de la soirée.
          </p>
        ) : (
          <ul className="setup-track-list">
            {tracks.map((track) => {
              const trackKey = track.id ?? track.external_track_id;

              return (
                <li className="setup-track" key={trackKey}>
                  {track.image_url && (
                    <img src={track.image_url} alt="" width="44" height="44" />
                  )}

                  <div className="setup-track-info">
                    <span className="setup-track-title">{track.title}</span>
                    <span className="setup-track-artist">{track.artist}</span>
                  </div>

                  <button
                    type="button"
                    className="setup-track-remove"
                    onClick={() => handleRemoveTrack(track)}
                    disabled={removingKey === trackKey}
                    aria-label={`Retirer ${track.title} de la soirée`}
                    title="Retirer le morceau"
                  >
                    <i
                      className={`fa-solid ${
                        removingKey === trackKey
                          ? "fa-spinner fa-spin"
                          : "fa-xmark"
                      }`}
                      aria-hidden="true"
                    ></i>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Button
        type="button"
        onClick={handleNext}
        disabled={creating}
        text={
          creating
            ? "Création…"
            : isDraft
              ? "Créer ma soirée"
              : "Suivant"
        }
      />

      <p className="creation-hint">
        Tu peux passer cette étape : une soirée peut démarrer sans morceau.
      </p>
    </div>
  );
}
