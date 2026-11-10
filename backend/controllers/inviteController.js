import {
  getInvitePlaylistService,
  getInviteTracksService,
  addInviteTrackService,
} from "../services/inviteService.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function handleError(error, res, fallbackMessage) {
  if (error.code === "23505") {
    return res.status(409).json({ error: "This track is already in the playlist" });
  }
  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage });
}

export async function getInvitePlaylistController(req, res) {
  try {
    const { code } = req.params;
    if (!UUID_REGEX.test(code)) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    const playlist = await getInvitePlaylistService(code);
    return res.status(200).json(playlist);
  } catch (error) {
    return handleError(error, res, "Failed to fetch playlist");
  }
}

export async function getInviteTracksController(req, res) {
  try {
    const { code } = req.params;
    if (!UUID_REGEX.test(code)) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    const tracks = await getInviteTracksService(code);
    return res.status(200).json(tracks);
  } catch (error) {
    return handleError(error, res, "Failed to fetch tracks");
  }
}

export async function addInviteTrackController(req, res) {
  try {
    const { code } = req.params;
    if (!UUID_REGEX.test(code)) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const { external_track_id, spotify_uri, title, artist, image_url, duration_ms } =
      req.body;
    const duration = Number(duration_ms);

    if (
      typeof external_track_id !== "string" || !external_track_id.trim() ||
      typeof title !== "string" || !title.trim() ||
      typeof artist !== "string" || !artist.trim() ||
      !Number.isSafeInteger(duration) || duration <= 0
    ) {
      return res.status(400).json({ error: "Invalid track data" });
    }

    const track = await addInviteTrackService(code, {
      external_track_id: external_track_id.trim(),
      spotify_uri: spotify_uri || null,
      title: title.trim(),
      artist: artist.trim(),
      image_url: image_url || null,
      duration_ms: duration,
    });

    return res.status(201).json(track);
  } catch (error) {
    return handleError(error, res, "Failed to add track");
  }
}