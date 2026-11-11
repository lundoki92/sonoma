import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import SearchMusic from "../../components/SearchMusic";
import { getServiceIcon, getServiceLabel } from "./services.js";
import "./PlaylistSetup.css";

const TRACK_STATUS = {
  proposed: "Proposé",
  voting: "En vote",
  selected: "Validé",
  played: "Joué",
};

export default function PlaylistSetup() {
  const { id } = useParams();

  const [playlist, setPlaylist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load the playlist and its tracks when the step opens.
  useEffect(() => {
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
  }, [id]);

  // Save a Spotify track to the database.
  async function handleAddTrack(spotifyTrack) {
    try {
      setError("");

      const response = await fetch(`/api/playlists/${id}/tracks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_track_id: spotifyTrack.spotifyId,
          spotify_uri: `spotify:track:${spotifyTrack.spotifyId}`,
          title: spotifyTrack.title,
          artist: spotifyTrack.artist,
          image_url: spotifyTrack.cover,
          duration_ms: spotifyTrack.durationMs,
        }),
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
      <header className="creation-intro">
        <h1>Ajoute les premiers morceaux</h1>
        <p>
          Recherche dans le catalogue Spotify et prépare l'ambiance de ta
          soirée.
        </p>
      </header>

      <div className="setup-playlist-meta">
        <span className="creation-chip">
          <i className="fa-solid fa-compact-disc" aria-hidden="true"></i>
          {playlist.name}
        </span>

        <span className="creation-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(playlist.date_time).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        <span className="creation-chip">
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
            {tracks.map((track) => (
              <li className="setup-track" key={track.id}>
                {track.image_url && (
                  <img src={track.image_url} alt="" width="44" height="44" />
                )}

                <div className="setup-track-info">
                  <span className="setup-track-title">{track.title}</span>
                  <span className="setup-track-artist">{track.artist}</span>
                </div>

                <span
                  className={`setup-track-status status-${track.status}`}
                >
                  {TRACK_STATUS[track.status] ?? track.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link className="creation-submit" to={`/playlist/${id}/share`}>
        Suivant
      </Link>

      <p className="creation-hint">
        Tu peux passer cette étape : une soirée peut démarrer sans morceau.
      </p>
    </div>
  );
}
