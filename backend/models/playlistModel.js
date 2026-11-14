import pool from "../server/db.js";

// Crée la soirée et ses premiers morceaux dans une seule transaction, et la
// crée déjà ouverte : il n'existe plus d'état intermédiaire entre la fin du
// wizard et l'invitation active. Si un morceau échoue, rien n'est écrit.
export async function createActivePlaylistWithTracksModel(
  name,
  dateTime,
  hostId,
  inviteCode,
  streamingService = "spotify",
  tracks = [],
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const playlistResult = await client.query(
      `
        INSERT INTO playlists (
          name,
          date_time,
          host_id,
          invite_code,
          streaming_service,
          status
        )
        VALUES ($1, $2, $3, $4, $5, 'active')
        RETURNING *;
      `,
      [name, dateTime, hostId, inviteCode, streamingService],
    );

    const playlist = playlistResult.rows[0];
    const insertedTracks = [];

    for (const track of tracks) {
      const trackResult = await client.query(
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
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'voting')
          RETURNING *;
        `,
        [
          playlist.id,
          track.external_track_id,
          track.spotify_uri,
          track.title,
          track.artist,
          track.image_url,
          track.duration_ms,
        ],
      );

      insertedTracks.push(trackResult.rows[0]);
    }

    await client.query("COMMIT");

    return { ...playlist, tracks: insertedTracks };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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
// Normalisation paresseuse des données héritées de l'ancien système de
// brouillon. Une soirée en `preparing` ne peut plus être créée depuis que la
// création ouvre la soirée, et un morceau en `proposed` n'entre dans aucun
// vote : sans ce passage, ces lignes resteraient bloquées chez les personnes
// qui les ont produites avant la bascule. Idempotent et sans migration SQL à
// faire tourner.
export async function normalizeLegacyPartyModel(hostId) {
  const result = await pool.query(
    `
      WITH reopened AS (
        UPDATE playlists
        SET status = 'active'
        WHERE host_id = $1 AND status = 'preparing'
        RETURNING id
      )
      UPDATE tracks
      SET status = 'voting'
      WHERE status = 'proposed'
        AND playlist_id IN (
          SELECT id FROM playlists WHERE host_id = $1
          UNION
          SELECT id FROM reopened
        )
    `,
    [hostId],
  );

  return result.rowCount;
}

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
// Same counters as the list, so one screen can show them without a second call.
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
// Public invite payload: only what a guest needs to recognise the party.
export async function getPlaylistByInviteCodeModel(code) {
  const result = await pool.query(
    `
      SELECT playlists.id,
             playlists.name,
             playlists.date_time,
             playlists.status,
             users.username AS host_name
      FROM playlists
      JOIN users ON users.id = playlists.host_id
      WHERE playlists.invite_code = $1
    `,
    [code],
  );
  return result.rows[0] ?? null;
}
