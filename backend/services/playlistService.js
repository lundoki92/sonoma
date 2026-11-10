import { randomUUID } from "node:crypto";
import {
  createPlaylistModel,
  getPlaylistByIdModel,
} from "../models/playlistModel.js";

// Create a playlist using the data prepared by the controller.
export async function createPlaylistService(name, date_time, host_id) {
  // Generate a unique invitation code for the playlist.
  const inviteCode = randomUUID();

  // Normalize the playlist name before storing it in the database.
  return createPlaylistModel(name.trim(), date_time, host_id, inviteCode);
}

// Retrieve a playlist from the database.
export async function getPlaylistByIdService(id) {
  return getPlaylistByIdModel(id);
}
