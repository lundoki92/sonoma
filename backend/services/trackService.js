import { ErrorHttp } from "../errors.js";
import {
  getPlaylistStatusForHostModel,
  getHostTracksByPlaylistModel,
  addTrackToPlaylistModel,
  deleteHostTrackModel,
} from "../models/trackModel.js";

// Retrieve all tracks from a playlist after checking that it exists.
export async function getTracksByPlaylistService(playlistId, hostId) {
  const playlist = await getPlaylistStatusForHostModel(playlistId, hostId);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  // The host sees their own tracks here; guest proposals live in the vote.
  return getHostTracksByPlaylistModel(playlistId);
}

// Add a track proposed by the host.
// Une soirée n'existe qu'une fois ouverte : le morceau entre directement en
// phase de vote, il n'y a plus de statut intermédiaire « proposed ».
export async function addTrackToPlaylistService(playlistId, hostId, data) {
  const playlist = await getPlaylistStatusForHostModel(playlistId, hostId);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  if (playlist.status === "finished") {
    throw new ErrorHttp(409, "Cette soirée est terminée.");
  }

  try {
    return await addTrackToPlaylistModel(playlistId, data, "voting");
  } catch (error) {
    // 23505: the track is already in this party.
    if (error.code === "23505") {
      throw new ErrorHttp(409, "Ce morceau a déjà été proposé.");
    }

    throw error;
  }
}

// Remove a track added by the host.
export async function deleteTrackFromPlaylistService(
  playlistId,
  hostId,
  trackId,
) {
  const playlist = await getPlaylistStatusForHostModel(playlistId, hostId);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  // Tracks can be removed while the party runs; a finished party is read-only.
  if (playlist.status === "finished") {
    throw new ErrorHttp(409, "Cette soirée est terminée.");
  }

  // Only host tracks (not guest proposals) can be removed from this screen.
  const track = await deleteHostTrackModel(playlistId, trackId);

  if (!track) throw new ErrorHttp(404, "Morceau introuvable.");

  return track;
}
