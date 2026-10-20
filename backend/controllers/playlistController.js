import {
  createPlaylistService,
  getPlaylistByIdService,
  getPlaylistTracksService,
  addTrackToPlaylistService,
} from "../services/playlistService.js";

// Create a new playlist
export const createPlaylist = async (req, res) => {
  try {
    const playlist = await createPlaylistService(req.body);

    return res.status(201).json(playlist);
  } catch (error) {
    console.error("Error creating playlist:", error);

    return res.status(error.status || 500).json({
      error: error.status
        ? error.message
        : "Failed to create playlist",
    });
  }
};

// Get a playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await getPlaylistByIdService(req.params.id);

    return res.json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);

    return res.status(error.status || 500).json({
      error: error.status
        ? error.message
        : "Failed to fetch playlist",
    });
  }
};

// Get tracks from a playlist
export const getPlaylistTracks = async (req, res) => {
  try {
    const tracks = await getPlaylistTracksService(req.params.id);

    return res.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);

    return res.status(error.status || 500).json({
      error: error.status
        ? error.message
        : "Failed to fetch tracks",
    });
  }
};

// Add a track to a playlist
export const addTrackToPlaylist = async (req, res) => {
  try {
    const track = await addTrackToPlaylistService(
      req.params.id,
      req.body
    );

    return res.status(201).json(track);
  } catch (error) {
    console.error("Error adding track:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "This track is already in the playlist",
      });
    }

    return res.status(error.status || 500).json({
      error: error.status
        ? error.message
        : "Failed to add track",
    });
  }
};
