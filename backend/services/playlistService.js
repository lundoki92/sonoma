import { randomUUID } from "node:crypto";
import {
  createPlaylistWithTracksModel,
  getPlaylistsByHostIdModel,
  getPlaylistByIdAndHostModel,
  startPlaylistByIdAndHostModel,
  updatePlaylistByIdAndHostModel,
} from "../models/playlistModel.js";

// Create a playlist using the data prepared by the controller.
// The first tracks are inserted at the same time as the playlist so the
// whole step 2 is validated in one database transaction.
export async function createPlaylistService(
  name,
  date_time,
  host_id,
  streaming_service = "spotify",
  tracks = [],
) {
  // Generate a unique invitation code for the playlist.
  const inviteCode = randomUUID();

  // Normalize the playlist name before storing it in the database.
  return createPlaylistWithTracksModel(
    name.trim(),
    date_time,
    host_id,
    inviteCode,
    streaming_service,
    tracks,
  );
}

// Start a playlist: it moves from "preparing" to "active" and can then be
// used by guests for proposals and votes.
export async function startPlaylistService(id, hostId) {
  const playlist = await getPlaylistByIdAndHostModel(id, hostId);

  if (!playlist) return null;

  if (playlist.status !== "preparing") {
    const error = new Error("Only preparing playlists can be started");
    error.statusCode = 400;
    throw error;
  }

  return startPlaylistByIdAndHostModel(id, hostId);
}

// Update the editable fields of a playlist owned by the host.
// Undefined fields are left untouched by the model.
export async function updatePlaylistService(id, hostId, fields) {
  return updatePlaylistByIdAndHostModel(id, hostId, {
    name: fields.name === undefined ? null : fields.name.trim(),
    date_time: fields.date_time ?? null,
    streaming_service: fields.streaming_service ?? null,
  });
}

// All playlists owned by a host.
export async function getPlaylistsByHostService(hostId) {
  return getPlaylistsByHostIdModel(hostId);
}

// A single playlist, only if it belongs to the host.
export async function getPlaylistByIdService(id, hostId) {
  return getPlaylistByIdAndHostModel(id, hostId);
}
