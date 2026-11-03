// Rôle : Uniquement de l'aiguillage. Aucune logique, aucun if, aucun pool.query

import { Router } from "express";
import * as voteController from "../controllers/voteController.js";

const routeVote = Router();

// Pool de vote : morceaux votables + statut "voted" du host
routeVote.get("/:playlistId/voting-tracks", voteController.getVotingTracks);

// Toggle du vote d'un host
routeVote.post(
  "/:playlistId/tracks/:trackId/vote",
  voteController.toggleHostVote,
);

// Toggle du vote d'un invité
routeVote.post(
  "/:playlistId/tracks/:trackId/guest-vote",
  voteController.toggleGuestVote,
);

export default routeVote;
