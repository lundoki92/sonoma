import pool from ".././server/db.js";

async function createPlaylistModel(name, date_time, hostId, inviteCode) {
    // Insert the playlist into PostgreSQL

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

  return result.rows[0];
}

export default createPlaylistModel;