import { ErrorHttp } from "../errors.js";
import {
  getTracksByPlaylistService,
  addTrackToPlaylistService,
  deleteTrackFromPlaylistService,
} from "../services/trackService.js";

// Les contrôleurs ne choisissent plus les codes HTTP : ils lisent la requête,
// préviennent les entrées mal formées, et laissent `errorsManagement` répondre.

// Read a numeric id, or answer 400.
function parseId(value, label = "Identifiant invalide.") {
  if (!/^\d+$/.test(value)) {
    throw new ErrorHttp(400, label);
  }

  return value;
}

// Handle the retrieval of tracks belonging to a playlist.
export async function getTracksByPlaylistController(req, res) {
  const playlistId = parseId(req.params.playlistId, "Identifiant de soirée invalide.");

  const tracks = await getTracksByPlaylistService(playlistId, req.user.id);

  return res.status(200).json(tracks);
}

// Handle the addition of a track to a playlist.
export async function addTrackToPlaylistController(req, res) {
  const playlistId = parseId(req.params.playlistId, "Identifiant de soirée invalide.");

  const {
    external_track_id,
    spotify_uri,
    title,
    artist,
    image_url,
    duration_ms,
  } = req.body;

  // Accept numeric strings such as "213000".
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
    (image_url !== undefined && image_url !== null && typeof image_url !== "string")
  ) {
    throw new ErrorHttp(422, "Données de morceau invalides.");
  }

  // Normalize the data before passing it to the service.
  const track = await addTrackToPlaylistService(playlistId, req.user.id, {
    external_track_id: external_track_id.trim(),
    spotify_uri: spotify_uri || null,
    title: title.trim(),
    artist: artist.trim(),
    image_url: image_url || null,
    duration_ms: duration,
  });

  return res.status(201).json(track);
}

// Handle the removal of a host track from a playlist.
export async function deleteTrackFromPlaylistController(req, res) {
  const playlistId = parseId(req.params.playlistId, "Identifiant de soirée invalide.");
  const trackId = parseId(req.params.trackId, "Identifiant de morceau invalide.");

  const track = await deleteTrackFromPlaylistService(playlistId, req.user.id, trackId);

  return res.status(200).json(track);
}
