import {
  getPlaylistStatusForHostModel,
  getHostTracksByPlaylistModel,
  addTrackToPlaylistModel,
  deleteHostTrackModel,
} from "../models/trackModel.js";

// Retrieve all tracks from a playlist after checking that it exists.
export async function getTracksByPlaylistService(playlistId, hostId) {
  // Retrieve the playlist status to verify that the playlist exists.
  const playlist = await getPlaylistStatusForHostModel(playlistId, hostId);

  // Stop the operation if the playlist does not exist.
  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }

  // Fetch the tracks belonging to the playlist.
  return getHostTracksByPlaylistModel(playlistId);
}

// Add a track to a playlist while applying the playlist's business rules.
export async function addTrackToPlaylistService(playlistId, hostId, data) {
  // Retrieve the playlist status before attempting to add the track.
  const playlist = await getPlaylistStatusForHostModel(playlistId, hostId);

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
  playlist.status === "preparing" ? "proposed" : "voting";

  // Delegate the database insertion to the model layer.
  return addTrackToPlaylistModel(
    playlistId,
    data,
    trackStatus
  );
}

// Remove a track chosen by the host during the preparation of the playlist.
export async function deleteTrackFromPlaylistService(
  playlistId,
  hostId,
  trackId,
) {
  // Check that the playlist exists and belongs to this host.
  const playlist = await getPlaylistStatusForHostModel(playlistId, hostId);

  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }

  // Tracks can only be removed while the playlist is still being prepared.
  if (playlist.status !== "preparing") {
    const error = new Error("Tracks can only be removed while preparing");
    error.statusCode = 400;
    throw error;
  }

  // Only host tracks (not guest proposals) can be removed from this screen.
  const track = await deleteHostTrackModel(playlistId, trackId);

  if (!track) {
    const error = new Error("Track not found");
    error.statusCode = 404;
    throw error;
  }

  return track;
}