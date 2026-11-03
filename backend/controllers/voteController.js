// Rôle : Gère tout ce qui est HTTP. Il parle au front, pas directement à la base.
// Son travail : extraire -> appeler le service -> formater la réponse.

import * as voteService from "../services/voteService.js";

export async function vote(req, res) {
  try {
    const { sessionId } = req.params;
    const { votingPoolId } = req.body;
    const { guestId } = req.body;

    await voteService.vote({ sessionId, votingPoolId, guestId });
    return res.status(201).json({ message: "Vote enregistré" });
  } catch (error) {
    console.error(error);

    if (error.message == "SESSION_INACTIVE") {
      return res
        .status(403)
        .json({ message: "Cette session de vote n'est plus active" });
    }
    if (error.message == "ALREADY_VOTED") {
      return res.status(409).json({ message: "Tu as déjà voté pour ce round" });
    }
    if (error.message == "NOT_IN_POOL") {
      return res
        .status(400)
        .json({ message: "Ce morceau ne fait pas partie de ce vote" });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }
}
