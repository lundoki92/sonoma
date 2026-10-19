import { useState } from "react";
import "./SearchMusic.css";

const API_URL = "http://localhost:3000";

function SearchMusic({ onAddTrack, tracks = [] }) {
  // Store the user's search input
  const [search, setSearch] = useState("");

  // Store the tracks returned by Spotify
  const [results, setResults] = useState([]);

  // Manage the loading state during a search
  const [loading, setLoading] = useState(false);

  // Store error messages
  const [error, setError] = useState("");

  // Track which song is currently being added
  const [addingId, setAddingId] = useState(null);

  // Search for tracks using the Spotify API
  async function handleSearch(event) {
    event.preventDefault();

    // Prevent empty searches
    if (!search.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      // Send the search query to the backend
      const response = await fetch(
        `${API_URL}/api/music/search?q=${encodeURIComponent(search.trim())}`
      );

      // Check if the request was successful
      if (!response.ok) {
        throw new Error("Unable to search for tracks");
      }

      const data = await response.json();

      // Extract the tracks from the API response
      const songs = Array.isArray(data)
        ? data
        : Array.isArray(data.tracks)
          ? data.tracks
          : data.tracks?.items ?? [];

      // Display the search results
      setResults(songs);
    } catch (err) {
      setError(err.message);
    } finally {
      // Stop displaying the loading state
      setLoading(false);
    }
  }

  // Add a Spotify track to the current playlist
  async function handleAdd(track) {
    // Get the track ID
    const trackId = track.id ?? track.external_track_id;

    setAddingId(trackId);

    try {
      console.log("TRACK TO ADD:", track);
      // Call the function provided by PlaylistPage
      await onAddTrack(track);
    } catch (err) {
      setError(err.message);
    } finally {
      // Re-enable the add button
      setAddingId(null);
    }
  }

  return (
    <section className="music-search">
      {/* Search form */}
      <form className="music-search-form" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Rechercher un titre ou un artiste..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {/* Display search errors */}
      {error && <p className="music-error">{error}</p>}

      {/* Display Spotify search results */}
      {results.length > 0 && (
        <div className="music-results">
          <h3>Résultats Spotify</h3>

          {results.map((track) => {
            // Get the track information from the API response
            const trackId = track.id ?? track.external_track_id;

            const trackTitle = track.name ?? track.title;

            const trackArtist = Array.isArray(track.artists)
              ? track.artists.map((artist) => artist.name).join(", ")
              : track.artist;

            // Get the album cover from the Spotify API response
            const trackImage = track.cover;

            // Check whether the track is already in the playlist
            const alreadyAdded = tracks.some(
              (addedTrack) => addedTrack.external_track_id === trackId
            );

            return (
              <div className="music-result" key={trackId}>
                {/* Album cover */}
                  {trackImage && (
                    <img
                      className="music-cover"
                      src={trackImage}
                      alt={track.title}
                    />
                  )}

                {/* Track title and artists */}
                <div className="music-info">
                  <strong>{trackTitle}</strong>
                  <span>{trackArtist}</span>
                </div>

                {/* Add track button */}
                <button
                  className="music-add-button"
                  type="button"
                  onClick={() => handleAdd(track)}
                  disabled={alreadyAdded || addingId === trackId}
                  title={
                    alreadyAdded
                      ? "Déjà ajouté"
                      : "Ajouter le morceau"
                  }
                >
                  {alreadyAdded
                    ? "✓"
                    : addingId === trackId
                      ? "…"
                      : "+"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Display a message when the search returns no results */}
      {!loading && results.length === 0 && !error && (
        <p className="music-empty">
          Recherchez un morceau pour afficher les résultats.
        </p>
      )}
    </section>
  );
}

export default SearchMusic;

