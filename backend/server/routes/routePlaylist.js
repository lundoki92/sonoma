import express from "express";
import { randomUUID } from "node:crypto";
import pool from "../../server/db.js";

const routePlaylist = express.Router();

// Create a new playlist
routePlaylist.post("/", async (req, res) => {
  try {
    const { name, date_time } = req.body;

    // Validate the playlist name
    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        error: "Invalid playlist name",
      });
    }

    // Validate the date
    if (
      typeof date_time !== "string" ||
      !date_time.trim() ||
      Number.isNaN(Date.parse(date_time))
    ) {
      return res.status(400).json({
        error: "Invalid playlist date",
      });
    }

    // Temporary host ID for local testing
    const hostId = 2;

    // Generate a unique invitation code
    const inviteCode = randomUUID();

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
      [name.trim(), date_time, hostId, inviteCode]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
  console.error("Error creating playlist:", error);

  return res.status(500).json({
    error: error.message,
    code: error.code,
  });
}
});

// Get a playlist by ID
routePlaylist.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM playlists WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({
      error: "Failed to fetch playlist",
    });
  }
});

// Get tracks from a playlist
routePlaylist.get("/:id/tracks", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT *
       FROM tracks
       WHERE playlist_id = $1
       ORDER BY created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({
      error: "Failed to fetch tracks",
    });
  }
});

// Add a track to a playlist
routePlaylist.post("/:id/tracks", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      external_track_id,
      title,
      artist,
      image_url,
      duration_ms,
    } = req.body;

    if (
      !external_track_id ||
      !title ||
      !artist ||
      !Number.isInteger(duration_ms) ||
      duration_ms <= 0
    ) {
      return res.status(400).json({
        error: "Invalid track data",
      });
    }

    const playlistResult = await pool.query(
      "SELECT status FROM playlists WHERE id = $1",
      [id]
    );

    if (playlistResult.rows.length === 0) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    const playlistStatus = playlistResult.rows[0].status;

    const trackStatus =
      playlistStatus === "preparing" ? "selected" : "proposed";

    if (playlistStatus === "finished") {
      return res.status(400).json({
        error: "This playlist is finished",
      });
    }

    const result = await pool.query(
      `INSERT INTO tracks (
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
      RETURNING *`,
      [
        id,
        external_track_id,
        title,
        artist,
        image_url || null,
        duration_ms,
        trackStatus,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding track:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        error: "This track is already in the playlist",
      });
    }

    res.status(500).json({
      error: "Failed to add track",
    });
  }
});

export default routePlaylist;