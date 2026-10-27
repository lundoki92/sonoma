
import { searchSpotifyTracks } from "../services/spotifyService.js";

// Handle track searches using the Spotify service.
export async function searchSpotifyTracksController(req, res) {
  try {
    // Retrieve the search query from the URL parameters.
    const query = req.query.q;

    // Ensure the query is a string containing at least three characters.
    if (
      typeof query !== "string" ||
      query.trim().length < 3
    ) {
      return res.status(400).json({
        message: "At least 3 characters are required",
      });
    }

    // Delegate the Spotify search to the service layer.
    const tracks = await searchSpotifyTracks(query.trim());

    // Return the search results to the frontend.
    return res.status(200).json(tracks);
  } catch (error) {
    // Log the error for debugging.
    console.error("Error searching Spotify tracks:", error);

    // Return a gateway error if the Spotify search fails.
    return res.status(502).json({
      message: "Failed to search Spotify",
    });
  }
}
