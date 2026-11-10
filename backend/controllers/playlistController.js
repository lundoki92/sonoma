import {
  createPlaylistService,
  getPlaylistByIdService,
  getPlaylistsByHostService,
} from "../services/playlistService.js";

// Handle the creation of a new playlist.
export async function createPlaylistController(req, res) {
  try {
    const { name, date_time } = req.body;
    const host_id = req.user.id;

    // Validate the playlist name.
    // The name must be a non-empty string with a maximum of 100 characters.
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({
        error: "Invalid playlist name",
      });
    }

    // Validate the playlist date.
    // The date must be a non-empty string that can be parsed as a valid date.
    if (
      typeof date_time !== "string" ||
      !date_time.trim() ||
      Number.isNaN(Date.parse(date_time))
    ) {
      return res.status(400).json({
        error: "Invalid playlist date",
      });
    }

    if (!Number.isInteger(host_id) || host_id <= 0) {
      return res.status(400).json({ error: "Invalid host ID" });
    }

    // Delegate the business logic to the service layer.
    const playlist = await createPlaylistService(name, date_time, host_id);

    // Return the newly created playlist.
    return res.status(201).json(playlist);
  } catch (error) {
    // Log unexpected errors on the server.
    console.error("Error creating playlist:", error);

    return res.status(500).json({
      error: "Failed to create playlist",
    });
  }
}

// Handle the retrieval of a playlist by its ID.
export async function getPlaylistByIdController(req, res) {
  try {
    const { id } = req.params;

    // Ensure that the playlist ID contains only digits.
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "Invalid playlist ID",
      });
    }

    // Ask the service layer to retrieve the playlist.
    const playlist = await getPlaylistByIdService(id, req.user.id);

    // Return 404 if the playlist does not exist.
    if (!playlist) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    // Return the playlist data.
    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);

    return res.status(500).json({
      error: "Failed to fetch playlist",
    });
  }
}

export async function getMyPlaylistsController(req, res) {
  try {
    const playlists = await getPlaylistsByHostService(req.user.id);
    return res.status(200).json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return res.status(500).json({ error: "Failed to fetch playlists" });
  }
}
