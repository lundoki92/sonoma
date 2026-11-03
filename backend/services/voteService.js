// Rôle : C'est ici que vivent toutes les règles de ton application.
// Si demain tu changes une règle, c'est dans CE fichier que tu changes.

import * as voteModel from "../models/voteModel.js";

export async function vote({ sessionId, votingPoolId, guestId }) {
  // Règle 1 : Vérifier que la session existe et qu'elle est bien "active"
  const session = await voteModel.findSessionById(sessionId);
  if (!session || session.status !== "active") {
    throw new Error("SESSION_INACTIVE");
  }

  // Règle 2 : Vérifier que cet invité n'a pas déjà voté pour CETTE session
  const existingVote = await voteModel.findVoteBySessionAndVote({
    sessionId,
    guestId,
  });
  if (existingVote) {
    throw new Error("ALREADY_VOTED");
  }

  // Règle 3 : Vérifier que le morceau fait bien partie du voting_pool de CETTE session
  const inPool = await voteModel.isTrackInVotingPool({
    sessionId,
    votingPoolId,
  });
  if (!inPool) {
    throw new Error("NOT_IN_POOL");
  }

  // Si toutes les règles sont validées
  await voteModel.createVote({ sessionId, votingPoolId, guestId });
}
