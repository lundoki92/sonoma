
import { ErrorHttp } from "../errors.js";
import { searchSpotifyTracks } from "../services/spotifyService.js";

// Handle track searches using the Spotify service.
export async function searchSpotifyTracksController(req, res) {
  const query = req.query.q;

  // Ensure the query is a string containing at least three characters.
  if (typeof query !== "string" || query.trim().length < 3) {
    throw new ErrorHttp(422, "Au moins 3 caractères sont nécessaires.");
  }

  try {
    // Delegate the Spotify search to the service layer.
    const tracks = await searchSpotifyTracks(query.trim());

    return res.status(200).json(tracks);
  } catch (error) {
    console.error("Spotify search failed:", error);

    // Une recherche qui échoue chez Spotify n'est pas une erreur du serveur.
    throw new ErrorHttp(502, "La recherche Spotify a échoué.");
  }
}

