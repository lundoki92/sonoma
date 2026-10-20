import pool from "../server/db.js";

// Create a playlist
export const createPlaylist = async ({
  name,
  date_time,
  hostId,
  inviteCode,
}) => {
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
};

// Find a playlist by ID
export const findPlaylistById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM playlists WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
};

// Find a playlist status
export const findPlaylistStatus = async (id) => {
  const result = await pool.query(
    "SELECT status FROM playlists WHERE id = $1",
    [id]
  );

  return result.rows[0]?.status ?? null;
};

// Find tracks belonging to a playlist
export const findTracksByPlaylistId = async (playlistId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM tracks
    WHERE playlist_id = $1
    ORDER BY created_at DESC
    `,
    [playlistId]
  );

  return result.rows;
};

// Insert a track into a playlist
export const insertTrack = async ({
  playlistId,
  external_track_id,
  title,
  artist,
  image_url,
  duration_ms,
  added_by,
  status,
}) => {
  const result = await pool.query(
    `
    INSERT INTO tracks (
      playlist_id,
      external_track_id,
      title,
      artist,
      image_url,
      duration_ms,
      added_by,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `,
    [
      playlistId,
      external_track_id,
      title,
      artist,
      image_url,
      duration_ms,
      added_by,
      status,
    ]
  );

  return result.rows[0];
};
