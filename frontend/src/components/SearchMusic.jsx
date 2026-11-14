import { useState } from "react";
import { searchTracks } from "../api/music.js";
import "./SearchMusic.css";

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
      // La recherche passe par la couche api : plus d'URL absolue ici.
      const songs = await searchTracks(search);

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
          aria-label="Rechercher un titre ou un artiste"
          placeholder="Rechercher un titre ou un artiste..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <button
          className="music-search-submit"
          type="submit"
          disabled={loading}
          aria-label="Rechercher"
          title="Rechercher"
        >
          <i
            className={`fa-solid ${
              loading ? "fa-spinner fa-spin" : "fa-magnifying-glass"
            }`}
            aria-hidden="true"
          ></i>
        </button>
      </form>

      {/* Display search errors */}
      {error && <p className="music-error">{error}</p>}

      {/* Display Spotify search results */}
      {results.length > 0 && (
        <div className="music-results">
          <h3>Résultats Spotify</h3>

          {results.map((track) => {
            // Get the track information from the API response.
            // The Spotify service returns spotifyId, while playlist tracks
            // use external_track_id.
            const trackId =
              track.spotifyId ?? track.id ?? track.external_track_id;

            const trackTitle = track.title ?? track.name;

            const trackArtist = track.artist
              ? track.artist
              : Array.isArray(track.artists)
                ? track.artists.map((artist) => artist.name).join(", ")
                : "";

            // Get the album cover from the Spotify API response
            const trackImage = track.cover ?? track.image_url;

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
                  className={`music-add-button${
                    alreadyAdded ? " is-added" : ""
                  }`}
                  type="button"
                  onClick={() => handleAdd(track)}
                  disabled={alreadyAdded || addingId === trackId}
                  aria-label={
                    alreadyAdded
                      ? `${trackTitle} est déjà dans la soirée`
                      : `Ajouter ${trackTitle}`
                  }
                  title={
                    alreadyAdded
                      ? "Ajouté à la soirée"
                      : "Ajouter le morceau"
                  }
                >
                  {alreadyAdded ? (
                    <i className="fa-solid fa-check" aria-hidden="true"></i>
                  ) : addingId === trackId ? (
                    <i
                      className="fa-solid fa-spinner fa-spin"
                      aria-hidden="true"
                    ></i>
                  ) : (
                    <i className="fa-solid fa-plus" aria-hidden="true"></i>
                  )}
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

