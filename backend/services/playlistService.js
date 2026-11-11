import { randomUUID } from "node:crypto";
import {
  createPlaylistModel,
  getPlaylistsByHostIdModel,
  getPlaylistByIdAndHostModel,
  updatePlaylistByIdAndHostModel,
} from "../models/playlistModel.js";

// Create a playlist using the data prepared by the controller.
export async function createPlaylistService(
  name,
  date_time,
  host_id,
  streaming_service = "spotify",
) {
  // Generate a unique invitation code for the playlist.
  const inviteCode = randomUUID();

  // Normalize the playlist name before storing it in the database.
  return createPlaylistModel(
    name.trim(),
    date_time,
    host_id,
    inviteCode,
    streaming_service,
  );
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
