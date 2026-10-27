import pool from "../server/db.js";

// Insert a new playlist into the database.
export async function createPlaylistModel(
  name,
  date_time,
  hostId,
  inviteCode
) {
  const result = await pool.query(
    `
      INSERT INTO playlists (
        name,
        date_time,
        host_id,
        invite_code
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `,
    [name, date_time, hostId, inviteCode]
  );

  // Return the newly created playlist.
  return result.rows[0];
}

// Retrieve a playlist using its database ID.
export async function getPlaylistByIdModel(id) {
  const result = await pool.query(
    "SELECT * FROM playlists WHERE id = $1",
    [id]
  );

  // Return null when no playlist matches the provided ID.
  return result.rows[0] ?? null;
}