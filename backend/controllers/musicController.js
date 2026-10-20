import { searchMusicService } from "../services/musicService.js";

export const searchMusic = async (req, res) => {
  try {
    const query = req.query.q;

    if (
      typeof query !== "string" ||
      query.trim().length < 3
    ) {
      return res.status(400).json({
        message: "Il faut au moins 3 caractères",
      });
    }

    const tracks = await searchMusicService(query.trim());

    return res.status(200).json(tracks);
  } catch (error) {
    console.error("Error searching Spotify:", error);

    return res.status(502).json({
      message: "Erreur lors de la recherche Spotify",
    });
  }
};
