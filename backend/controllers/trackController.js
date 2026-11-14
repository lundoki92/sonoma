import {
  getTracksByPlaylistService,
  addTrackToPlaylistService,
  deleteTrackFromPlaylistService,
} from "../services/trackService.js";

// Handle the retrieval of tracks belonging to a playlist.
export async function getTracksByPlaylistController(req, res) {
  try {
    const { playlistId } = req.params;

    // Validate the playlist ID before calling the service.
    if (!/^\d+$/.test(playlistId)) {
      return res.status(400).json({
        error: "Invalid playlist ID",
      });
    }

    // Retrieve the tracks through the service layer.
    const tracks = await getTracksByPlaylistService(playlistId, req.user.id);

    // Return the list of tracks.
    return res.status(200).json(tracks);
  } catch (error) {
    // Return the appropriate status for known application errors.
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error("Error fetching tracks:", error);

    return res.status(500).json({
      error: "Failed to fetch tracks",
    });
  }
}

// Handle the addition of a track to a playlist.
export async function addTrackToPlaylistController(req, res) {
  try {
    const { playlistId } = req.params;

    // Validate the playlist ID.
    if (!/^\d+$/.test(playlistId)) {
      return res.status(400).json({
        error: "Invalid playlist ID",
      });
    }

    // Extract the track information sent by the client.
    const {
      external_track_id,
      spotify_uri,
      title,
      artist,
      image_url,
      duration_ms,
    } = req.body;

    // Convert the duration to a number.
    // This also allows numeric strings such as "213000".
    const duration = Number(duration_ms);

    // Validate the required track fields and their types.
    if (
      typeof external_track_id !== "string" ||
      !external_track_id.trim() ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof artist !== "string" ||
      !artist.trim() ||
      duration_ms === null ||
      duration_ms === undefined ||
      (typeof duration_ms === "string" && !duration_ms.trim()) ||
      !Number.isSafeInteger(duration) ||
      duration <= 0 ||
      (
        image_url !== undefined &&
        image_url !== null &&
        typeof image_url !== "string"
      )
    ) {
      return res.status(400).json({
        error: "Invalid track data",
      });
    }

    // Normalize the data before passing it to the service.
    const track = await addTrackToPlaylistService(playlistId, req.user.id, {
      external_track_id: external_track_id.trim(),
      spotify_uri: spotify_uri || null,
      title: title.trim(),
      artist: artist.trim(),
      image_url: image_url || null,
      duration_ms: duration,
    });

    // Return the newly created track.
    return res.status(201).json(track);
  } catch (error) {
    // PostgreSQL error code 23505 indicates a unique constraint violation.
    // In this case, the track is already present in the playlist.
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Ce morceau a déjà été proposé"});
    }

    // Handle expected business errors, such as a missing or finished playlist.
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    // Log unexpected errors for debugging.
    console.error("Error adding track:", error);

    return res.status(500).json({
      error: "Failed to add track",
    });
  }
}

// Handle the removal of a host track from a playlist.
export async function deleteTrackFromPlaylistController(req, res) {
  try {
    const { playlistId, trackId } = req.params;

    // Validate both IDs before calling the service.
    if (!/^\d+$/.test(playlistId) || !/^\d+$/.test(trackId)) {
      return res.status(400).json({
        error: "Invalid track or playlist ID",
      });
    }

    const track = await deleteTrackFromPlaylistService(
      playlistId,
      req.user.id,
      trackId,
    );

    return res.status(200).json(track);
  } catch (error) {
    // Return the appropriate status for known application errors.
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    console.error("Error deleting track:", error);

    return res.status(500).json({
      error: "Failed to delete track",
    });
  }
}