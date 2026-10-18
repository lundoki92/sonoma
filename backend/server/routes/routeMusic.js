import { Router } from "express";
import { searchSpotifyTracks } from "../../services/spotifyService.js";

const routeMusic = Router();

// Route GET pour rechercher des morceaux
routeMusic.get("/search", async (req, res) => {
  try {
    // Récupérer la recherche depuis l'URL
    const query = req.query.q;

    // Vérifier que la recherche est valide
    if (
      typeof query !== "string" ||
      query.trim().length < 3
    ) {
      return res.status(400).json({
        message: "Il faut au moins 3 caractères"
      });
    }

    // Appeler ton service Spotify
    const tracks = await searchSpotifyTracks(query.trim());

    // Envoyer les résultats au frontend
    return res.status(200).json(tracks);

  } catch (error) {
    console.error(error);

    return res.status(502).json({
      message: "Erreur lors de la recherche Spotify"
    });
  }
});

export default routeMusic;