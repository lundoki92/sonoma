import pool from "../server/db.js";

// Insert a new playlist into the database.
export async function createPlaylistModel(
  name,
  date_time,
  hostId,
  inviteCode,
  streamingService = "spotify",
) {
  const result = await pool.query(
    `
      INSERT INTO playlists (
        name,
        date_time,
        host_id,
        invite_code,
        streaming_service
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `,
    [name, date_time, hostId, inviteCode, streamingService],
  );

  // Return the newly created playlist.
  return result.rows[0];
}

// Update the editable fields of a playlist owned by a host.
// A null value leaves the existing column unchanged.
export async function updatePlaylistByIdAndHostModel(
  id,
  hostId,
  { name, date_time, streaming_service },
) {
  const result = await pool.query(
    `
      UPDATE playlists
      SET
        name = COALESCE($3, name),
        date_time = COALESCE($4, date_time),
        streaming_service = COALESCE($5, streaming_service)
      WHERE id = $1 AND host_id = $2
      RETURNING *;
    `,
    [id, hostId, name, date_time, streaming_service],
  );

  return result.rows[0] ?? null;
}

// Retrieve all playlists that belong to a given host.
export async function getPlaylistsByHostIdModel(hostId) {
  const result = await pool.query(
    "SELECT * FROM playlists WHERE host_id = $1 ORDER BY date_time DESC",
    [hostId],
  );
  return result.rows;
}

// Retrieve a playlist only if it belongs to the given host.
export async function getPlaylistByIdAndHostModel(id, hostId) {
  const result = await pool.query(
    "SELECT * FROM playlists WHERE id = $1 AND host_id = $2",
    [id, hostId],
  );
  return result.rows[0] ?? null;
}

// Retrieve a playlist using its invite code.
export async function getPlaylistByInviteCodeModel(code) {
  const result = await pool.query(
    "SELECT id, name, date_time, status FROM playlists WHERE invite_code = $1",
    [code],
  );
  return result.rows[0] ?? null;
}
