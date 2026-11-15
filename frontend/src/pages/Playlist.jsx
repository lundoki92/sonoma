import { useEffect, useState } from "react";
import { useParams } from "react-router";
import SearchMusic from "../components/SearchMusic";
import Header from "../components/common/Header";
import Button from "../components/common/Button";
import { useAuth } from "../context/AuthContext.jsx";
import "./Playlist.css";

// Mêmes libellés que les badges de la home, pour une seule lecture du statut.
const STATUS = {
  preparing: { label: "En préparation", className: "preparing" },
  active: { label: "En direct", className: "live" },
  finished: { label: "Terminée", className: "archived" },
};

const TRACK_STATUS = {
  proposed: "Proposé",
  voting: "Au vote",
  played: "Joué",
};


function PlaylistPage() {
  // Get the playlist ID from the URL
  const { id } = useParams();
  const { user } = useAuth();

  // Store the playlist information
  const [playlist, setPlaylist] = useState(null);

  // Store the tracks added to the playlist
  const [tracks, setTracks] = useState([]);

  // Store error messages
  const [error, setError] = useState("");

  // Manage the loading state
  const [loading, setLoading] = useState(true);


  // Load the playlist and its tracks when the page opens
  useEffect(() => {
    let cancelled = false;

    async function fetchPlaylist() {
      try {
        // Fetch playlist details and tracks simultaneously
        const [playlistResponse, tracksResponse] = await Promise.all([
          fetch(`/api/playlists/${id}`),
          fetch(`/api/playlists/${id}/tracks`),
        ]);

        // Check whether both requests were successful
        if (!playlistResponse.ok || !tracksResponse.ok) {
          throw new Error("Impossible de charger la soirée");
        }

        // Convert the responses into JavaScript objects
        const playlistData = await playlistResponse.json();
        const tracksData = await tracksResponse.json();

        // Update the state only if the component is still active
        if (!cancelled) {
          setPlaylist(playlistData);
          setTracks(tracksData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        // Stop displaying the loading state
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPlaylist();

    // Prevent state updates after the effect is cleaned up
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Save a Spotify track to the database
  async function handleAddTrack(spotifyTrack) {
    try {
      setError("");
      // Send the selected track to the backend
      const response = await fetch(
        `/api/playlists/${id}/tracks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Get the Spotify track ID
            external_track_id: spotifyTrack.spotifyId,
            spotify_uri: `spotify:track:${spotifyTrack.spotifyId}`,

            // Get the track title and artist
            title: spotifyTrack.title,
            artist: spotifyTrack.artist,

            // Get the album cover
            image_url: spotifyTrack.cover,

            // Get the track duration in milliseconds
            duration_ms: spotifyTrack.durationMs,
          }),
        }
      );

      const data = await response.json();

      // Display an error if the track could not be saved
      if (!response.ok) {
        throw new Error(data.error || "Impossible d'ajouter le morceau");
      }

      // Add the saved track to the displayed list
      setTracks((previousTracks) => [data, ...previousTracks]);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  // Display a loading message while fetching data
  if (loading) {
    return (
      <main className="playlist-page">
        <p className="app-status">Chargement de la soirée...</p>
      </main>
    );
  }

  // Display an error if the playlist cannot be found
  if (!playlist) {
    return (
      <main className="playlist-page">
        <p className="app-status">{error || "Soirée introuvable"}</p>
      </main>
    );
  }

  const status = STATUS[playlist.status] ?? {
    label: "Inconnue",
    className: "unknown",
  };

  const date = new Date(playlist.date_time).toLocaleString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const inviteLink = `http://127.0.0.1:5173/join/${playlist.invite_code}`;

  return (
    <div className="playlist-page">
      <Header sessionTitle={playlist.name} userPseudo={user?.username} />

      <main className="playlist-content">
        {/* Le nom est déjà dans le header : la page ne garde que l'essentiel. */}
        <div className="app-meta-row">
          <span className={`app-chip status-${status.className}`}>
            {status.label}
          </span>

          <span className="app-chip">{date}</span>

          <span className="app-chip">
            <i className="fa-solid fa-music" aria-hidden="true"></i>
            {tracks.length} morceau{tracks.length > 1 ? "x" : ""}
          </span>
        </div>

        {/* Spotify music search */}
        <section className="playlist-section">
          <h2 className="section-title">Rechercher un morceau</h2>

          <SearchMusic onAddTrack={handleAddTrack} tracks={tracks} />
        </section>

        {/* Display errors when adding tracks */}
        {error && (
          <p className="app-error" role="alert">
            {error}
          </p>
        )}

        {/* Display tracks already added to the playlist */}
        <section className="playlist-section">
          <h2 className="section-title">
            Morceaux de la soirée
            <span className="section-count">({tracks.length})</span>
          </h2>

          {tracks.length === 0 ? (
            <p className="app-status">Aucun morceau ajouté pour le moment.</p>
          ) : (
            <ul className="track-list">
              {tracks.map((track) => (
                <li className="track-item" key={track.id}>
                  {/* Album cover */}
                  {track.image_url ? (
                    <img className="track-cover" src={track.image_url} alt="" />
                  ) : (
                    <span
                      className="track-cover track-cover--empty"
                      aria-hidden="true"
                    >
                      <i className="fa-solid fa-music"></i>
                    </span>
                  )}

                  {/* Track information */}
                  <div className="track-info">
                    <strong>{track.title}</strong>
                    <span>{track.artist}</span>
                  </div>

                  {/* Track status */}
                  <span
                    className={`track-status track-status--${track.status}`}
                  >
                    {TRACK_STATUS[track.status] ?? track.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Voting: the action unlocks once the party is live */}
        <div className="playlist-actions">
          <Button
            text="Soumettre au vote"
            disabled={playlist.status !== "active"}
          />

          {playlist.status === "preparing" && (
            <p className="playlist-note">
              Le vote sera disponible une fois la soirée démarrée.
            </p>
          )}
        </div>

        {/* Invite link */}
        <section className="share-card">
          <div className="share-text">
            <span className="share-label">Lien à partager</span>
            <code className="share-link">{inviteLink}</code>
          </div>

          <button
            type="button"
            className="share-copy"
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            Copier
          </button>
        </section>
      </main>
    </div>
  );
}

export default PlaylistPage;
