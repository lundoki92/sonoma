// Rôle : C'est ici que vivent toutes les règles de ton application.
// Si demain tu changes une règle, c'est dans CE fichier que tu changes.

import * as voteModel from "../models/voteModel.js";

export async function getVotingTracks({ playlistId, host_id }) {
  const playlist = await voteModel.findPlaylistById(playlistId, host_id);

  if (!playlist) {
    throw new Error("PLAYLIST_NOT_FOUND");
  }

  if (Number(playlist.host_id) !== Number(hostId)) {
    throw new Error("NOT_PLAYLIST_HOST");
  }

  return voteModel.getVotingTracksByPlaylist({
    playlistId,
    host_id,
  });
}

export async function toggleVote({
  playlistId,
  trackId,
  host_id = null,
  guestId = null,
}) {
  // Règle 1 : il faut exactement un votant (host OU invité)
  const isHost = host_id !== null && host_id !== undefined;
  const isGuest = guestId !== null && guestId !== undefined;
  if (isHost === isGuest) {
    throw new Error("INVALID_VOTER");
  }

  // Règle 2 : la playlist doit exister et être active
  const playlist = await voteModel.findPlaylistById(playlistId);
  if (!playlist) {
    throw new Error("PLAYLIST_NOT_FOUND");
  }
  if (playlist.status !== "active") {
    throw new Error("PLAYLIST_INACTIVE");
  }

  // Règle 3 : le morceau doit exister, appartenir à cette playlist
  // et être dans la phase de vote
  const track = await voteModel.findTrackById(trackId);
  if (!track || Number(track.playlist_id) !== Number(playlistId)) {
    throw new Error("TRACK_NOT_FOUND");
  }
  if (track.status !== "voting") {
    throw new Error("TRACK_NOT_VOTABLE");
  }

  // Règle 4 : vérifier l'identité du votant
  if (isHost) {
    if (Number(playlist.host_id) !== Number(host_id)) {
      throw new Error("NOT_PLAYLIST_HOST");
    }
  } else {
    const guest = await voteModel.findGuestInPlaylist({
      guestId,
      playlistId,
    });
    if (!guest) {
      throw new Error("GUEST_NOT_IN_PLAYLIST");
    }
  }

  // Règle 5 : toggle (ajouter / retirer le vote)
  const existingVote = await voteModel.findVoteByVoterAndTrack({
    trackId,
    playlistId,
    host_id,
    guestId,
  });

  if (existingVote) {
    await voteModel.deleteVote({ trackId,playlistId, host_id, guestId });
    return { voted: false };
  }

  await voteModel.createVote({ trackId,playlistId, host_id, guestId });
  return { voted: true };
}
