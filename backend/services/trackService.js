import {
  getPlaylistStatusModel,
  getTracksByPlaylistModel,
  addTrackToPlaylistModel,
} from "../models/trackModel.js";

// Retrieve all tracks from a playlist after checking that it exists.
export async function getTracksByPlaylistService(playlistId) {
  // Retrieve the playlist status to verify that the playlist exists.
  const playlist = await getPlaylistStatusModel(playlistId);

  // Stop the operation if the playlist does not exist.
  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }

  // Fetch the tracks belonging to the playlist.
  return getTracksByPlaylistModel(playlistId);
}

// Add a track to a playlist while applying the playlist's business rules.
export async function addTrackToPlaylistService(playlistId, data) {
  // Retrieve the playlist status before attempting to add the track.
  const playlist = await getPlaylistStatusModel(playlistId);

  // A track cannot be added to a playlist that does not exist.
  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent modifications to a finished playlist.
  if (playlist.status === "finished") {
    const error = new Error("This playlist is finished");
    error.statusCode = 400;
    throw error;
  }

  // Determine the track status according to the playlist status.
  // Tracks added during preparation are selected automatically.
  // Tracks added in other non-finished states are proposed.
  const trackStatus =
    playlist.status === "preparing" ? "selected" : "proposed";

  // Delegate the database insertion to the model layer.
  return addTrackToPlaylistModel(
    playlistId,
    data,
    trackStatus
  );
}