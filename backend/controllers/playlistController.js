import { ErrorHttp } from "../errors.js";
import {
  createPlaylistService,
  getPlaylistByIdService,
  getPlaylistsByHostService,
  updatePlaylistService,
} from "../services/playlistService.js";

// Les contrôleurs ne font que traduire HTTP ⇄ services.
// Les erreurs montent en `ErrorHttp` jusqu'au middleware `errorsManagement`,
// qui est le seul endroit où un code HTTP est choisi (Express 5 propulse
// automatiquement les promesses rejetées vers ce middleware).

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
      throw new ErrorHttp(422, "Le nom de la soirée est invalide.");
    }
  }

  if (required || date_time !== undefined) {
    // The date must be a non-empty string that can be parsed as a valid date.
    if (
      typeof date_time !== "string" ||
      !date_time.trim() ||
      Number.isNaN(Date.parse(date_time))
    ) {
      throw new ErrorHttp(422, "La date de la soirée est invalide.");
    }
  }

  if (
    streaming_service !== undefined &&
    !STREAMING_SERVICES.includes(streaming_service)
  ) {
    throw new ErrorHttp(422, "Service de streaming inconnu.");
  }
}

// Validate and normalize the first tracks sent with a new playlist.
function normalizeTracks(tracks) {
  if (tracks === undefined) return [];

  if (!Array.isArray(tracks)) {
    throw new ErrorHttp(422, "Liste de morceaux invalide.");
  }

  const normalized = [];
  const seen = new Set();

  for (const track of tracks) {
    if (!track || typeof track !== "object") {
      throw new ErrorHttp(422, "Liste de morceaux invalide.");
    }

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
      throw new ErrorHttp(422, "Données de morceau invalides.");
    }

    const externalId = external_track_id.trim();

    // La base refuse les doublons dans une même soirée : on les voit ici pour
    // répondre un 422 clair plutôt qu'un 409 en fin de transaction.
    if (seen.has(externalId)) {
      throw new ErrorHttp(422, "Un morceau est proposé deux fois.");
    }

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

// Read a numeric id, or answer 400.
function parseId(value) {
  if (!/^\d+$/.test(value)) {
    throw new ErrorHttp(400, "Identifiant de soirée invalide.");
  }

  return value;
}

// Create a party and open it: this is the last step of the wizard.
export async function createPlaylistController(req, res) {
  const {
    name,
    date_time,
    streaming_service = "spotify",
    tracks,
  } = req.body;
  const host_id = req.user.id;

  validatePlaylistFields(
    { name, date_time, streaming_service },
    { required: true },
  );

  const normalizedTracks = normalizeTracks(tracks);

  if (!Number.isInteger(host_id) || host_id <= 0) {
    throw new ErrorHttp(401, "Session invalide.");
  }

  // Delegate the business logic to the service layer.
  const playlist = await createPlaylistService(
    name,
    date_time,
    host_id,
    streaming_service,
    normalizedTracks,
  );

  return res.status(201).json(playlist);
}

// Handle the edition of an existing playlist.
export async function updatePlaylistController(req, res) {
  const id = parseId(req.params.id);
  const { name, date_time, streaming_service } = req.body;

  validatePlaylistFields(
    { name, date_time, streaming_service },
    { required: false },
  );

  if (
    name === undefined &&
    date_time === undefined &&
    streaming_service === undefined
  ) {
    throw new ErrorHttp(400, "Aucun champ à modifier.");
  }

  // The service answers 404 when the party does not belong to this host.
  const playlist = await updatePlaylistService(id, req.user.id, {
    name,
    date_time,
    streaming_service,
  });

  return res.status(200).json(playlist);
}

// Handle the retrieval of a playlist by its ID.
export async function getPlaylistByIdController(req, res) {
  const id = parseId(req.params.id);

  const playlist = await getPlaylistByIdService(id, req.user.id);

  return res.status(200).json(playlist);
}

// Handle the retrieval of every party owned by the host.
export async function getMyPlaylistsController(req, res) {
  const playlists = await getPlaylistsByHostService(req.user.id);

  return res.status(200).json(playlists);
}
