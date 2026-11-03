// Rôle : Uniquement du SQL. Pas d'if, pas de throw, pas de message HTTP.

import pool from "../server/db.js";

// Récupère une session de vote par son ID
export async function findSessionById(sessionId) {
  const result = await pool.query(
    "SELECT * FROM voting_sessions WHERE id = $1",
    [sessionId],
  );
  // On retourne la session trouvée, ou null si elle n'existe pas
  return result.rows[0] ?? null;
}

// Vérifie si un invité a déjà voté dans cette session de vote
export async function findVoteBySessionAndVote({ sessionId, guestId }) {
  const result = await pool.query(
    "SELECT * FROM votes WHERE voting_session_id = $1 AND guest_id = $2",
    [sessionId, guestId],
  );
  // On retourne le vote existant, ou null s'il n'y en a pas encore
  return result.rows[0] ?? null;
}

// Vérifie si le morceau choisi fait bien partie du voting_pool pour cette session
export async function isTrackInVotingPool({ sessionId, votingPoolId }) {
  const result = await pool.query(
    "SELECT 1 FROM voting_pool WHERE id = $1 AND voting_session_id = $2",
    [sessionId, votingPoolId],
  );
  // On se fiche du contenu, on veut juste savoir s'il existe au moins une ligne
  return result.rows.length > 0;
}

// Crée un vote pour un invité dans cette session
export async function createVote({ sessionId, votingPoolId, guestId }) {
  const result = await pool.query(
    "INSERT INTO votes (voting_session_id, voting_pool_id, guest_id) VALUES ($1, $2, $3) RETURNING *",
    [sessionId, votingPoolId, guestId],
  );
  // RETURNING * permet de récupérer directement la ligne insérée en base
  return result.rows[0];
}
