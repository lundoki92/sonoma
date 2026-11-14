import {
  createPlaylistService,
  getPlaylistByIdService,
  getPlaylistsByHostService,
  startPlaylistService,
  updatePlaylistService,
} from "../services/playlistService.js";

// Services accepted by the API. Only Spotify is wired in the UI for now,
// the other two are exposed so the data model can already store them.
const STREAMING_SERVICES = ["spotify", "deezer", "apple_music"];

// Validate the fields shared by playlist creation and edition.
// On creation every field is required; on edition only the provided ones
// are checked, so the client can send a partial update.
function validatePlaylistFields(
  { name, date_time, streaming_service },
  { required },
) {
  if (required || name !== undefined) {
    // The name must be a non-empty string with a maximum of 100 characters.
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return "Invalid playlist name";
    }
  }

  if (required || date_time !== undefined) {
    // The date must be a non-empty string that can be parsed as a valid date.
    if (
      typeof date_time !== "string" ||
      !date_time.trim() ||
      Number.isNaN(Date.parse(date_time))
    ) {
      return "Invalid playlist date";
    }
  }

  if (
    streaming_service !== undefined &&
    !STREAMING_SERVICES.includes(streaming_service)
  ) {
    return "Invalid streaming service";
  }

  return null;
}

// Validate and normalize the optional first tracks sent with a new playlist.
// Returns null when one track is invalid.
function normalizeTracks(tracks) {
  if (tracks === undefined) return [];

  if (!Array.isArray(tracks)) return null;

  const normalized = [];
  const seen = new Set();

  for (const track of tracks) {
    if (!track || typeof track !== "object") return null;

    const {
      external_track_id,
      spotify_uri,
      title,
      artist,
      image_url,
      duration_ms,
    } = track;

    const duration = Number(duration_ms);

    if (
      typeof external_track_id !== "string" ||
      !external_track_id.trim() ||
      typeof title !== "string" ||
      !title.trim() ||
      typeof artist !== "string" ||
      !artist.trim() ||
      duration_ms === null ||
      duration_ms === undefined ||
      (typeof duration_ms === "string" && !duration_ms.trim()) ||
      !Number.isSafeInteger(duration) ||
      duration <= 0 ||
      (image_url !== undefined &&
        image_url !== null &&
        typeof image_url !== "string") ||
      (spotify_uri !== undefined &&
        spotify_uri !== null &&
        typeof spotify_uri !== "string")
    ) {
      return null;
    }

    const externalId = external_track_id.trim();

    // The database rejects duplicates inside a playlist; catch them before
    // starting the transaction to return a clear 400 instead of a 500.
    if (seen.has(externalId)) return null;
    seen.add(externalId);

    normalized.push({
      external_track_id: externalId,
      spotify_uri: spotify_uri?.trim() || null,
      title: title.trim(),
      artist: artist.trim(),
      image_url: image_url?.trim() || null,
      duration_ms: duration,
    });
  }

  return normalized;
}

// Handle the creation of a new playlist.
export async function createPlaylistController(req, res) {
  try {
    const {
      name,
      date_time,
      streaming_service = "spotify",
      tracks,
    } = req.body;
    const host_id = req.user.id;

    const validationError = validatePlaylistFields(
      { name, date_time, streaming_service },
      { required: true },
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const normalizedTracks = normalizeTracks(tracks);

    if (normalizedTracks === null) {
      return res.status(400).json({ error: "Invalid track data" });
    }

    if (!Number.isInteger(host_id) || host_id <= 0) {
      return res.status(400).json({ error: "Invalid host ID" });
    }

    // Delegate the business logic to the service layer.
    const playlist = await createPlaylistService(
      name,
      date_time,
      host_id,
      streaming_service,
      normalizedTracks,
    );

    // Return the newly created playlist.
    return res.status(201).json(playlist);
  } catch (error) {
    // Log unexpected errors on the server.
    console.error("Error creating playlist:", error);

    return res.status(500).json({
      error: "Failed to create playlist",
    });
  }
}

// Handle the launch of a party: the playlist becomes active.
export async function startPlaylistController(req, res) {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid playlist ID" });
    }

    const playlist = await startPlaylistService(id, req.user.id);

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(200).json(playlist);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error("Error starting playlist:", error);

    return res.status(500).json({
      error: "Failed to start playlist",
    });
  }
}

// Handle the edition of an existing playlist.
export async function updatePlaylistController(req, res) {
  try {
    const { id } = req.params;

    // Ensure that the playlist ID contains only digits.
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ error: "Invalid playlist ID" });
    }

    const { name, date_time, streaming_service } = req.body;

    const validationError = validatePlaylistFields(
      { name, date_time, streaming_service },
      { required: false },
    );

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    if (
      name === undefined &&
      date_time === undefined &&
      streaming_service === undefined
    ) {
      return res.status(400).json({ error: "No fields to update" });
    }

    // The service checks that the playlist belongs to the host.
    const playlist = await updatePlaylistService(id, req.user.id, {
      name,
      date_time,
      streaming_service,
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Error updating playlist:", error);

    return res.status(500).json({
      error: "Failed to update playlist",
    });
  }
}

// Handle the retrieval of a playlist by its ID.
export async function getPlaylistByIdController(req, res) {
  try {
    const { id } = req.params;

    // Ensure that the playlist ID contains only digits.
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: "Invalid playlist ID",
      });
    }

    // Ask the service layer to retrieve the playlist.
    const playlist = await getPlaylistByIdService(id, req.user.id);

    // Return 404 if the playlist does not exist.
    if (!playlist) {
      return res.status(404).json({
        error: "Playlist not found",
      });
    }

    // Return the playlist data.
    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);

    return res.status(500).json({
      error: "Failed to fetch playlist",
    });
  }
}

export async function getMyPlaylistsController(req, res) {
  try {
    const playlists = await getPlaylistsByHostService(req.user.id);
    return res.status(200).json(playlists);
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return res.status(500).json({ error: "Failed to fetch playlists" });
  }
}
