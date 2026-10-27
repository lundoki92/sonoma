import { randomUUID } from "node:crypto";
import {
  createPlaylistModel,
  getPlaylistByIdModel,
} from "../models/playlistModel.js";

// Create a playlist using the data prepared by the controller.
export async function createPlaylistService(name, date_time) {
  // Temporary host ID used for testing.
  // Replace this value with the authenticated user's ID in the future.
  const hostId = 2;

  // Generate a unique invitation code for the playlist.
  const inviteCode = randomUUID();

  // Normalize the playlist name before storing it in the database.
  return createPlaylistModel(
    name.trim(),
    date_time,
    hostId,
    inviteCode
  );
}

// Retrieve a playlist from the database.
export async function getPlaylistByIdService(id) {
  return getPlaylistByIdModel(id);
}