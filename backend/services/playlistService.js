import { randomUUID } from "node:crypto";
import {
  createPlaylistModel,
  getPlaylistsByHostIdModel,
  getPlaylistByIdAndHostModel,
} from "../models/playlistModel.js";

// Create a playlist using the data prepared by the controller.
export async function createPlaylistService(name, date_time, host_id) {
  // Generate a unique invitation code for the playlist.
  const inviteCode = randomUUID();

  // Normalize the playlist name before storing it in the database.
  return createPlaylistModel(name.trim(), date_time, host_id, inviteCode);
}

// All playlists owned by a host.
export async function getPlaylistsByHostService(hostId) {
  return getPlaylistsByHostIdModel(hostId);
}

// A single playlist, only if it belongs to the host.
export async function getPlaylistByIdService(id, hostId) {
  return getPlaylistByIdAndHostModel(id, hostId);
}
