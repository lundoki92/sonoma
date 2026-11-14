import pool from "../server/db.js";

// Insert a new playlist into the database.
export async function createPlaylistModel(name, date_time, hostId, inviteCode) {
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
    [name, date_time, hostId, inviteCode],
  );

  // Return the newly created playlist.
  return result.rows[0];
}

// Retrieve all playlists that belong to a given host.
// Récupère toutes les soirées d'un hôte, avec deux compteurs calculés à la
// volée : le nombre de morceaux proposés et le nombre d'invités rejoints.
// Aucune colonne ajoutée en base, ce sont des agrégats sur les tables déjà là.
export async function getPlaylistsByHostIdModel(hostId) {
  const result = await pool.query(
    `
      SELECT playlists.*,
             (
               SELECT COUNT(*)::int
               FROM tracks
               WHERE tracks.playlist_id = playlists.id
             ) AS track_count,
             (
               SELECT COUNT(*)::int
               FROM playlist_guests
               WHERE playlist_guests.playlist_id = playlists.id
             ) AS guest_count
      FROM playlists
      WHERE host_id = $1
      ORDER BY date_time DESC
    `,
    [hostId],
  );
  return result.rows;
}

// Retrieve a playlist only if it belongs to the given host.
export async function getPlaylistByIdAndHostModel(id, hostId) {
  const result = await pool.query(
    `
      SELECT playlists.*,
             (
               SELECT COUNT(*)::int
               FROM tracks
               WHERE tracks.playlist_id = playlists.id
             ) AS track_count,
             (
               SELECT COUNT(*)::int
               FROM playlist_guests
               WHERE playlist_guests.playlist_id = playlists.id
             ) AS guest_count
      FROM playlists
      WHERE playlists.id = $1 AND playlists.host_id = $2
    `,
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
