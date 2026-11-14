// Rôle : tout ce qui est HTTP pour les votes. Il parle au front, pas à la base.
// Les erreurs métier montent en `ErrorHttp` jusqu'au middleware d'erreurs.

import * as voteService from "../services/voteService.js";

// TODO: remplacer par l'utilisateur authentifié (req.user.id).
const TEMPORARY_HOST_ID = 4;

export async function getVotingTracks(req, res) {
  const tracks = await voteService.getVotingTracks({
    playlistId: req.params.playlistId,
    hostId: TEMPORARY_HOST_ID,
  });

  return res.status(200).json(tracks);
}

export async function toggleHostVote(req, res) {
  const result = await voteService.toggleVote({
    playlistId: req.params.playlistId,
    trackId: req.params.trackId,
    hostId: TEMPORARY_HOST_ID,
  });

  return res.status(result.voted ? 201 : 200).json(result);
}

export async function toggleGuestVote(req, res) {
  const result = await voteService.toggleVote({
    playlistId: req.params.playlistId,
    trackId: req.params.trackId,
    guestId: req.body.guestId,
  });

  return res.status(result.voted ? 201 : 200).json(result);
}
