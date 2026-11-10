// Rôle : Uniquement du SQL. Pas d'if, pas de throw, pas de message HTTP.

import pool from "../server/db.js";

// Morceaux votables d'une playlist + statut "voted" pour un host
export async function getVotingTracksByPlaylist({ playlistId, host_id }) {
  const result = await pool.query(
    `SELECT
       t.id,
       t.title,
       t.artist,
       t.image_url,
       t.status,
       EXISTS (
         SELECT 1 FROM votes v
         WHERE v.track_id = t.id AND v.host_id = $2
       ) AS voted
     FROM tracks t
     WHERE t.playlist_id = $1
       AND t.status = 'voting'`,
    [playlistId, host_id],
  );
  return result.rows;
}

// Récupère un morceau par son ID
export async function findTrackById(trackId) {
  const result = await pool.query(
    "SELECT id, playlist_id, status FROM tracks WHERE id = $1",
    [trackId],
  );
  return result.rows[0] ?? null;
}

// Récupère une playlist par son ID (host + statut)
export async function findPlaylistById(playlistId) {
  const result = await pool.query(
    "SELECT id, host_id, status FROM playlists WHERE id = $1",
    [playlistId],
  );
  return result.rows[0] ?? null;
}

// Vérifie qu'un invité appartient bien à cette playlist
export async function findGuestInPlaylist({ guestId, playlistId }) {
  const result = await pool.query(
    "SELECT id FROM playlist_guests WHERE id = $1 AND playlist_id = $2",
    [guestId, playlistId],
  );
  return result.rows[0] ?? null;
}

// Récupère le vote d'un host OU d'un invité pour un morceau
export async function findVoteByVoterAndTrack({
  trackId,
  playlistId,
  host_id = null,
  guestId = null,
}) {
  const result = await pool.query(
    `SELECT *
     FROM votes
     WHERE track_id = $1
       AND playlist_id = $2
       AND (
         ($3::int IS NOT NULL AND host_id = $3)
         OR
         ($4::int IS NOT NULL AND guest_id = $4)
       )`,
    [trackId, playlistId, host_id, guestId],
  );
  return result.rows[0] ?? null;
}

// Supprime le vote d'un host OU d'un invité pour un morceau
export async function deleteVote({ 
  trackId,
  playlistId,
  host_id = null, 
  guestId = null }) {
 await pool.query(
    `DELETE FROM votes
     WHERE track_id = $1
       AND playlist_id = $2
       AND (
         ($3::int IS NOT NULL AND host_id = $3)
         OR
         ($4::int IS NOT NULL AND guest_id = $4)
       )`,
    [trackId, playlistId, host_id, guestId],
  );
}

// Crée un vote pour un host OU un invité
export async function createVote({ 
  trackId,
  playlistId,
  host_id = null, 
  guestId = null }) {
const result = await pool.query(
    `INSERT INTO votes (
       track_id,
       playlist_id,
       host_id,
       guest_id
     )
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [trackId, playlistId, host_id, guestId],
  );
  return result.rows[0];
}
