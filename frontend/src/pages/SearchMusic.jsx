
import { useState } from "react";

export default function MusicSearch() {

  // Ce que l'utilisateur écrit dans la barre de recherche
  const [query, setQuery] = useState("");

  // Les morceaux renvoyés par notre backend
  const [tracks, setTracks] = useState([]);

  // Pour afficher un message pendant le chargement
  const [loading, setLoading] = useState(false);

  // Pour afficher les erreurs éventuelles
  const [error, setError] = useState("");

  // Fonction appelée quand on valide la recherche
  async function handleSearch(event) {
    event.preventDefault();

    // Éviter les recherches trop courtes
    if (query.trim().length < 3) {
      setError("Écris au moins 3 caractères.");
      setTracks([]);
      return;
    }

    setLoading(true);
    setError("");
    setTracks([]);

    try {
      // encodeURIComponent permet de gérer
      // les espaces et caractères spéciaux.
      const search = encodeURIComponent(query.trim());

      // On appelle NOTRE backend, pas Spotify directement.
      const response = await fetch(
        `http://127.0.0.1:3000/api/music/search?q=${search}`
      );

      if (!response.ok) {
        throw new Error("Erreur pendant la recherche.");
      }

      // Le backend nous renvoie un tableau JSON
      const data = await response.json();

      // On stocke les morceaux dans le state React
      setTracks(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Rechercher une musique</h2>

      {/* Formulaire de recherche */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Titre ou artiste..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Recherche..." : "Rechercher"}
        </button>
      </form>

      {/* Affichage des erreurs */}
      {error && <p>{error}</p>}

      {/* Affichage des résultats */}
      <div>
        {tracks.map((track) => (
          <div key={track.spotifyId}>

            {/* Pochette de l'album */}
            {track.cover && (
              <img
                src={track.cover}
                alt={`Pochette de ${track.title}`}
                width="70"
              />
            )}

            {/* Nom du morceau */}
            <h3>{track.title}</h3>

            {/* Artiste */}
            <p>{track.artist}</p>

          </div>
        ))}
      </div>
    </div>
  );
}
