// Rôle : toutes les règles de vote de l'application.
// Les erreurs montent en `ErrorHttp` : le middleware d'erreurs choisit le code
// HTTP, ici on ne décrit que l'interdit.

import * as voteModel from "../models/voteModel.js";
import { ErrorHttp } from "../errors.js";

export async function getVotingTracks({ playlistId, hostId }) {
  const playlist = await voteModel.findPlaylistById(playlistId);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  if (Number(playlist.host_id) !== Number(hostId)) {
    throw new ErrorHttp(403, "Tu n'es pas l'hôte de cette soirée.");
  }

  return voteModel.getVotingTracksByPlaylist({
    playlistId,
    hostId,
  });
}

export async function toggleVote({
  playlistId,
  trackId,
  hostId = null,
  guestId = null,
}) {
  // Règle 1 : il faut exactement un votant (hôte OU invité)
  const isHost = hostId !== null && hostId !== undefined;
  const isGuest = guestId !== null && guestId !== undefined;

  if (isHost === isGuest) {
    throw new ErrorHttp(400, "Votant invalide.");
  }

  // Règle 2 : la soirée doit exister et être ouverte
  const playlist = await voteModel.findPlaylistById(playlistId);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  if (playlist.status !== "active") {
    throw new ErrorHttp(403, "La soirée n'est pas en cours.");
  }

  // Règle 3 : le morceau doit exister, appartenir à cette soirée, et être
  // en phase de vote
  const track = await voteModel.findTrackById(trackId);

  if (!track || Number(track.playlist_id) !== Number(playlistId)) {
    throw new ErrorHttp(404, "Morceau introuvable.");
  }

  if (track.status !== "voting") {
    throw new ErrorHttp(409, "Ce morceau n'est plus soumis au vote.");
  }

  // Règle 4 : vérifier l'identité du votant
  if (isHost) {
    if (Number(playlist.host_id) !== Number(hostId)) {
      throw new ErrorHttp(403, "Tu n'es pas l'hôte de cette soirée.");
    }
  } else {
    const guest = await voteModel.findGuestInPlaylist({
      guestId,
      playlistId,
    });

    if (!guest) {
      throw new ErrorHttp(403, "Cet invité n'appartient pas à la soirée.");
    }
  }

  // Règle 5 : toggle (ajouter / retirer le vote)
  const existingVote = await voteModel.findVoteByVoterAndTrack({
    trackId,
    playlistId,
    hostId,
    guestId,
  });

  if (existingVote) {
    await voteModel.deleteVote({ trackId, playlistId, hostId, guestId });
    return { voted: false };
  }

  try {
    await voteModel.createVote({ trackId, playlistId, hostId, guestId });
  } catch (error) {
    // 23505: un vote concurrent a déjà été enregistré pour ce votant.
    if (error.code === "23505") {
      throw new ErrorHttp(409, "Tu as déjà voté pour ce morceau.");
    }

    // 22P02 / 23503: identifiants mal formés ou inexistants.
    if (error.code === "22P02" || error.code === "23503") {
      throw new ErrorHttp(400, "Identifiant invalide.");
    }

    throw error;
  }

  return { voted: true };
}
