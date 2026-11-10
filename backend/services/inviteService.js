import { getPlaylistByInviteCodeModel } from "../models/playlistModel.js";
import {
  getTracksByPlaylistModel,
  addTrackToPlaylistModel,
} from "../models/trackModel.js";

// Find the playlist behind an invite code, or throw a 404.
async function findPlaylistOrThrow(code) {
  const playlist = await getPlaylistByInviteCodeModel(code);
  if (!playlist) {
    const error = new Error("Playlist not found");
    error.statusCode = 404;
    throw error;
  }
  return playlist;
}

export async function getInvitePlaylistService(code) {
  return findPlaylistOrThrow(code);
}

export async function getInviteTracksService(code) {
  const playlist = await findPlaylistOrThrow(code);
  return getTracksByPlaylistModel(playlist.id);
}

export async function addInviteTrackService(code, data) {
  const playlist = await findPlaylistOrThrow(code);

  if (playlist.status === "finished") {
    const error = new Error("This playlist is finished");
    error.statusCode = 400;
    throw error;
  }

  // Same rule as for the host
  const trackStatus = playlist.status === "preparing" ? "proposed" : "voting";

  // The playlist id comes from the server, never from the client
  return addTrackToPlaylistModel(playlist.id, data, trackStatus);
}