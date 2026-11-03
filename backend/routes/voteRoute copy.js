import { Router } from "express";
import pool from "../../server/db.js";

const router = Router();

// GET : Récupérer le pool de vote avec le statut 'voted' (sans alias de tables)
router.get("/:id/voting-pool", async (req, res) => {
  try {
    const playlistId = req.params.id;
    const hostId = 4; 

    const query = `
      SELECT 
        tracks.id, 
        tracks.title, 
        tracks.artist, 
        tracks.image_url,
        voting_pool.id AS voting_pool_id,
        EXISTS (
          SELECT 1 FROM votes 
          WHERE votes.voting_pool_id = voting_pool.id AND votes.host_id = $2
        ) AS voted
      FROM voting_sessions
      JOIN voting_pool ON voting_pool.voting_session_id = voting_sessions.id
      JOIN tracks ON tracks.id = voting_pool.track_id
      WHERE voting_sessions.playlist_id = $1 AND voting_sessions.status = 'active';
    `;

    const { rows } = await pool.query(query, [playlistId, hostId]);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Erreur récupération pool de vote :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// POST : Basculer un vote (Ajouter / Supprimer)
router.post("/voting-pool/:votingPoolId/toggle", async (req, res) => {
  try {
    const { votingPoolId } = req.params;
    const hostId = 4;

    // 1. Récupérer le voting_session_id associé à ce voting_pool_id
    const poolQuery = `SELECT voting_session_id FROM voting_pool WHERE id = $1;`;
    const poolResult = await pool.query(poolQuery, [votingPoolId]);

    if (poolResult.rows.length === 0) {
      return res.status(404).json({ message: "Élément du pool introuvable" });
    }

    const votingSessionId = poolResult.rows[0].voting_session_id;

    // 2. Vérifier si le vote existe déjà
    const checkQuery = `
      SELECT id FROM votes 
      WHERE voting_pool_id = $1 AND host_id = $2;
    `;
    const checkResult = await pool.query(checkQuery, [votingPoolId, hostId]);

    if (checkResult.rows.length > 0) {
      // 3. Si le vote existe : on le supprime (Dévoter)
      const deleteQuery = `
        DELETE FROM votes 
        WHERE voting_pool_id = $1 AND host_id = $2;
      `;
      await pool.query(deleteQuery, [votingPoolId, hostId]);
      return res.status(200).json({ voted: false, message: "Vote retiré" });
    } else {
      // 4. Sinon : on l'insère en renseignant bien le voting_session_id
      const insertQuery = `
        INSERT INTO votes (voting_session_id, voting_pool_id, host_id) 
        VALUES ($1, $2, $3);
      `;
      await pool.query(insertQuery, [votingSessionId, votingPoolId, hostId]);
      return res.status(201).json({ voted: true, message: "Vote enregistré" });
    }
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du vote :", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;