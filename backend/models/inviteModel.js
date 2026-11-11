import pool from "../server/db.js";

export async function createGuestModel(playlistId, guestName, guestToken) {
  const result = await pool.query(
    `INSERT INTO playlist_guests (playlist_id, guest_name, guest_token)
     VALUES ($1, $2, $3)
     RETURNING id, playlist_id, guest_name`,
    [playlistId, guestName, guestToken],
  );
  return result.rows[0];
}

// Find a guest from its token, only if it belongs to the playlist of this invite code
export async function findGuestByTokenAndCodeModel(guestToken, code) {
  const result = await pool.query(
    `SELECT g.id, g.guest_name, g.playlist_id
     FROM playlist_guests g
     JOIN playlists p ON p.id = g.playlist_id
     WHERE g.guest_token = $1 AND p.invite_code = $2`,
    [guestToken, code],
  );
  return result.rows[0] ?? null;
}