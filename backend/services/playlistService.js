import { randomUUID } from "node:crypto";
import {
  createPlaylist,
  findPlaylistById,
  findPlaylistStatus,
  findTracksByPlaylistId,
  insertTrack,
} from "../models/playlistModel.js";

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Create a new playlist
export const createPlaylistService = async (data) => {
  const { name, date_time } = data;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100
  ) {
    throw createError("Invalid playlist name", 400);
  }

  if (
    typeof date_time !== "string" ||
    !date_time.trim() ||
    Number.isNaN(Date.parse(date_time))
  ) {
    throw createError("Invalid playlist date", 400);
  }

  // Temporary host ID for local testing
  const hostId = 2;
  const inviteCode = randomUUID();

  return createPlaylist({
    name: name.trim(),
    date_time,
    hostId,
    inviteCode,
  });
};

// Get a playlist by ID
export const getPlaylistByIdService = async (id) => {
  const playlist = await findPlaylistById(id);

  if (!playlist) {
    throw createError("Playlist not found", 404);
  }

  return playlist;
};

// Get tracks from a playlist
export const getPlaylistTracksService = async (id) => {
  return findTracksByPlaylistId(id);
};

// Add a track to a playlist
export const addTrackToPlaylistService = async (id, data) => {
  const {
    external_track_id,
    title,
    artist,
    image_url,
    duration_ms,
  } = data;

  if (
    !external_track_id ||
    !title ||
    !artist ||
    !Number.isInteger(duration_ms) ||
    duration_ms <= 0
  ) {
    throw createError("Invalid track data", 400);
  }

  const playlistStatus = await findPlaylistStatus(id);

  if (playlistStatus === null) {
    throw createError("Playlist not found", 404);
  }

  if (playlistStatus === "finished") {
    throw createError("This playlist is finished", 400);
  }

  const trackStatus =
    playlistStatus === "preparing" ? "selected" : "proposed";

  return insertTrack({
    playlistId: id,
    external_track_id,
    title,
    artist,
    image_url: image_url || null,
    duration_ms,
    added_by: "host",
    status: trackStatus,
  });
};
