import pool from "../server/db.js";

// Retrieve the status of a playlist. INVITE
// Returning null indicates that the playlist does not exist.
export async function getPlaylistStatusModel(playlistId) {
  const result = await pool.query(
    "SELECT status FROM playlists WHERE id = $1",
    [playlistId]
  );

  return result.rows[0] ?? null;
}

// Retrieve the status of a playlist, only if it belongs to the given host.
// Returning null means: the playlist does not exist OR is not owned by this host.
export async function getPlaylistStatusForHostModel(playlistId, hostId) {
  const result = await pool.query(
    "SELECT status FROM playlists WHERE id = $1 AND host_id = $2",
    [playlistId, hostId]
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
    spotify_uri,
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
        spotify_uri,
        title,
        artist,
        image_url,
        duration_ms,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `,
    [
      playlistId,
      external_track_id,
      spotify_uri,
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