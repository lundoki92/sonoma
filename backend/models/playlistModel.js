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

// Create a playlist and its first tracks in a single transaction.
// If one track cannot be inserted, nothing is written to the database.
export async function createPlaylistWithTracksModel(
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
          streaming_service
        )
        VALUES ($1, $2, $3, $4, $5)
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
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'proposed')
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

// Mark a playlist as active. Only a playlist owned by the host and still
// being prepared can be started.
export async function startPlaylistByIdAndHostModel(id, hostId) {
  const result = await pool.query(
    `
      UPDATE playlists
      SET status = 'active'
      WHERE id = $1 AND host_id = $2 AND status = 'preparing'
      RETURNING *;
    `,
    [id, hostId],
  );

  return result.rows[0] ?? null;
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
