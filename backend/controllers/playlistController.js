//lit req, construit res
import createPlaylistService from "../services/playlistService.js";


async function createPlaylistController(req, res) {
try {
    const { name, date_time } = req.body;

    // Validate the playlist name
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        error: "Invalid playlist name",
      });
    }

    // Validate the date
    if (
      typeof date_time !== "string" ||
      !date_time.trim() ||
      Number.isNaN(Date.parse(date_time))
    ) {
      return res.status(400).json({
        error: "Invalid playlist date",
      });
    }

    const result = await createPlaylistService(name, date_time);

    return res.status(201).json(result);
  } catch (error) {
  console.error("Error creating playlist:", error);

  return res.status(500).json({
    error: error.message,
    code: error.code,
  });
}
}

export default createPlaylistController;
