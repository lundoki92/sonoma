// Rôle : Uniquement de l'aiguillage. Aucune logique, aucun if, aucun pool.query

import { Router } from "express";
import * as voteController from "../controllers/voteController.js";
import { auth } from "../middlewares/auth.js";

const routeVote = Router();

// Pool de vote : morceaux votables + statut "voted" du host
routeVote.get("/:playlistId/voting-tracks", auth , voteController.getVotingTracks);

// Toggle du vote d'un host
routeVote.post("/:playlistId/tracks/:trackId/vote", auth, voteController.toggleHostVote );

// Toggle du vote d'un invité
routeVote.post("/:playlistId/tracks/:trackId/guest-vote", voteController.toggleGuestVote);

export default routeVote;
