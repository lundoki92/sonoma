// Rôle : Uniquement de l'aiguillage. Aucune logique, aucun if, aucun pool.query

import { Router } from "express";
import * as voteController from "../controllers/voteController.js";

const routeVote = Router();

routeVote.post("/sessions/:sessionId/vote", voteController.vote);

export default routeVote;
