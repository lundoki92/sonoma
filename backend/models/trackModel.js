import pool from "../server/db.js";

// Retrieve the status of a playlist.
// Returning null indicates that the playlist does not exist.
export async function getPlaylistStatusModel(playlistId) {
  const result = await pool.query(
    "SELECT status FROM playlists WHERE id = $1",
    [playlistId]
  );

  return result.rows[0] ?? null;
}

// Retrieve all tracks associated with a playlist.
// The most recently created tracks appear first.
export async function getTracksByPlaylistModel(playlistId) {
  const result = await pool.query(
    `
      SELECT *
      FROM tracks
      WHERE playlist_id = $1
      ORDER BY created_at DESC
    `,
    [playlistId]
  );

  // Return the array of tracks rather than the full PostgreSQL result.
  return result.rows;
}

// Insert a track into a playlist.
export async function addTrackToPlaylistModel(
  playlistId,
  data,
  trackStatus
) {
  // Extract the validated track data provided by the service.
  const {
    external_track_id,
    title,
    artist,
    image_url,
    duration_ms,
  } = data;

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
      VALUES ($1, $2, $3, $4, $5, $6, 'host', $7)
      RETURNING *;
    `,
    [
      playlistId,
      external_track_id,
      title,
      artist,
      image_url,
      duration_ms,
      trackStatus,
    ]
  );

  // Return the newly inserted track.
  return result.rows[0];
}