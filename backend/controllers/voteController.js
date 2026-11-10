// Rôle : Gère tout ce qui est HTTP. Il parle au front, pas directement à la base.
// Son travail : extraire -> appeler le service -> formater la réponse.

import * as voteService from "../services/voteService.js";

export async function getVotingTracks(req, res) {
  try {
    const { playlistId } = req.params;
    const host_id = req.user.id;

    const tracks = await voteService.getVotingTracks({ playlistId, host_id });
    return res.status(200).json(tracks);
  } catch (error) {
    return handleVoteError(error, res);
  }
}

export async function toggleHostVote(req, res) {
  try {
    const { playlistId, trackId } = req.params;
    const host_id = req.user.id;

    const result = await voteService.toggleVote({
      playlistId,
      trackId,
      host_id,
    });
    return res.status(result.voted ? 201 : 200).json(result);
  } catch (error) {
    return handleVoteError(error, res);
  }
}

export async function toggleGuestVote(req, res) {
  try {
    const { playlistId, trackId } = req.params;
    const { guestId } = req.body;

    const result = await voteService.toggleVote({
      playlistId,
      trackId,
      guestId,
    });
    return res.status(result.voted ? 201 : 200).json(result);
  } catch (error) {
    return handleVoteError(error, res);
  }
}

function handleVoteError(error, res) {
  console.error(error);

  // Erreurs PostgreSQL
  if (error.code === "23505") {
    return res
      .status(409)
      .json({ message: "Tu as déjà voté pour ce morceau" });
  }
  if (error.code === "22P02") {
    return res.status(400).json({ message: "Identifiant invalide" });
  }
  if (error.code === "23503") {
    return res.status(400).json({ message: "Référence invalide" });
  }

  // Erreurs métier
  switch (error.message) {
    case "INVALID_VOTER":
      return res.status(400).json({ message: "Votant invalide" });
    case "PLAYLIST_NOT_FOUND":
      return res.status(404).json({ message: "Playlist introuvable" });
    case "PLAYLIST_INACTIVE":
      return res
        .status(403)
        .json({ message: "La soirée n'est pas active" });
    case "TRACK_NOT_FOUND":
      return res.status(404).json({ message: "Morceau introuvable" });
    case "TRACK_NOT_VOTABLE":
      return res
        .status(409)
        .json({ message: "Ce morceau n'est pas votable" });
    case "NOT_PLAYLIST_HOST":
      return res
        .status(403)
        .json({ message: "Tu n'es pas le host de cette soirée" });
    case "GUEST_NOT_IN_PLAYLIST":
      return res
        .status(403)
        .json({ message: "Cet invité n'appartient pas à la soirée" });
    default:
      return res.status(500).json({ message: "Erreur serveur" });
  }
}
