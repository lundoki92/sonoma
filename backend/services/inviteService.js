import { getPlaylistByInviteCodeModel } from "../models/playlistModel.js";
import { randomUUID } from "node:crypto";
import { ErrorHttp } from "../errors.js";
import { createGuestModel } from "../models/inviteModel.js";
import {
  getGuestTracksByPlaylistModel,
  addTrackToPlaylistModel,
  deleteGuestTrackModel,
} from "../models/trackModel.js";

// Find the playlist behind an invite code, or throw a 404.
async function findPlaylistOrThrow(code) {
  const playlist = await getPlaylistByInviteCodeModel(code);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  return playlist;
}

// Une soirée n'existe pour un invité qu'à partir du moment où l'hôte l'a
// créée : il n'y a plus de brouillon partageable. Le seul état fermé est la
// soirée terminée.
function assertPartyAcceptsGuests(playlist) {
  if (playlist.status === "finished") {
    throw new ErrorHttp(409, "Cette soirée est terminée.");
  }
}

// Public payload: what a guest needs to recognise the party.
export async function getInvitePlaylistService(code) {
  const playlist = await findPlaylistOrThrow(code);

  // Une soirée terminée doit encore s'afficher, avec son message de fin.
  return playlist;
}

// A guest only sees the tracks they proposed: the host tracks (and the other
// guests' proposals) belong to the party, not to this screen.
export async function getInviteTracksService(code, guestId) {
  const playlist = await findPlaylistOrThrow(code);
  assertPartyAcceptsGuests(playlist);

  return getGuestTracksByPlaylistModel(playlist.id, guestId);
}

// A guest proposal joins the vote straight away.
export async function addInviteTrackService(code, guestId, data) {
  const playlist = await findPlaylistOrThrow(code);
  assertPartyAcceptsGuests(playlist);

  try {
    // The playlist id comes from the server, never from the client.
    return await addTrackToPlaylistModel(playlist.id, data, "voting", guestId);
  } catch (error) {
    // 23505: the track is already in this party.
    if (error.code === "23505") {
      throw new ErrorHttp(409, "Ce morceau a déjà été proposé.");
    }

    throw error;
  }
}

// Remove one of the guest's own proposals, while the party is not over.
export async function deleteInviteTrackService(code, guestId, trackId) {
  const playlist = await findPlaylistOrThrow(code);
  assertPartyAcceptsGuests(playlist);

  const track = await deleteGuestTrackModel(playlist.id, trackId, guestId);

  if (!track) throw new ErrorHttp(404, "Morceau introuvable.");

  return track;
}

export async function joinPlaylistService(code, guestName) {
  const playlist = await findPlaylistOrThrow(code);
  assertPartyAcceptsGuests(playlist);

  const guestToken = randomUUID();
  const guest = await createGuestModel(playlist.id, guestName.trim(), guestToken);

  return { guest, guestToken };
}
