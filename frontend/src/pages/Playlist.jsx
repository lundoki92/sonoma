import { useEffect, useState } from "react";
import { useParams } from "react-router";
import SearchMusic from "../assets/SearchMusic";

const API_URL = "http://localhost:3000";

function PlaylistPage() {
  // Get the playlist ID from the URL
  const { id } = useParams();

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
          fetch(`${API_URL}/api/playlists/${id}`),
          fetch(`${API_URL}/api/playlists/${id}/tracks`),
        ]);

        // Check whether both requests were successful
        if (!playlistResponse.ok || !tracksResponse.ok) {
          throw new Error("Unable to load the playlist");
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
        `${API_URL}/api/playlists/${id}/tracks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Get the Spotify track ID
            external_track_id: spotifyTrack.id ?? spotifyTrack.external_track_id,

            // Get the track title
            title: spotifyTrack.name ?? spotifyTrack.title,

            // Get the artist name
            artist: Array.isArray(spotifyTrack.artists)
                ? spotifyTrack.artists.map((artist) => artist.name).join(", ")
                : spotifyTrack.artist,

            // Get the album cover
            image_url: spotifyTrack.cover ?? null,

            // Get the track duration
            duration_ms: spotifyTrack.duration_ms,
            }),
        }
      );

      const data = await response.json();

      // Display an error if the track could not be saved
      if (!response.ok) {
        throw new Error(data.error || "Unable to add the track");
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
    return <p>Chargement de la soirée...</p>;
  }

  // Display an error if the playlist cannot be found
  if (!playlist) {
    return <p>{error || "Soirée introuvable"}</p>;
  }

  return (
    <main>
      {/* Playlist information */}
      <h1>{playlist.name}</h1>

      <p>
        Date : {new Date(playlist.date_time).toLocaleString("fr-FR")}
      </p>

      <p>Statut : {playlist.status}</p>

      {/* Spotify music search */}
      <h2>Rechercher un morceau</h2>

      <SearchMusic
        onAddTrack={handleAddTrack}
        tracks={tracks}
      />

      {/* Display errors when adding tracks */}
      {error && <p role="alert">{error}</p>}

      {/* Display tracks already added to the playlist */}
      <h2>Morceaux de la soirée ({tracks.length})</h2>

      {tracks.length === 0 ? (
        <p>Aucun morceau ajouté pour le moment.</p>
      ) : (
        <ul>
          {tracks.map((track) => (
            <li key={track.id}>
              {/* Album cover */}
              {track.image_url && (
                <img
                  src={track.image_url}
                  alt=""
                  width="50"
                />
              )}

              {/* Track information */}
              <span>
                {track.title} — {track.artist}
              </span>

              {/* Track status */}
              <span> ({track.status})</span>
            </li>
          ))}
        </ul>
      )}

      {/* Voting button: functionality will be added later */}
      <button
        type="button"
        disabled={playlist.status !== "active"}
      >
        Soumettre au vote
      </button>

      {/* Explain why voting is not available yet */}
      {playlist.status === "preparing" && (
        <p>
          Le vote sera disponible une fois la soirée démarrée.
        </p>
      )}
    </main>
  );
}

export default PlaylistPage;