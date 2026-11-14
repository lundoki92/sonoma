import { ErrorHttp } from "../errors.js";
import {
  getInvitePlaylistService,
  getInviteTracksService,
  addInviteTrackService,
  deleteInviteTrackService,
  joinPlaylistService,
} from "../services/inviteService.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Un code d'invitation mal formé n'atteint jamais la base.
function parseCode(value) {
  if (!UUID_REGEX.test(value)) {
    throw new ErrorHttp(404, "Lien d'invitation invalide.");
  }

  return value;
}

export async function getInvitePlaylistController(req, res) {
  const code = parseCode(req.params.code);

  const playlist = await getInvitePlaylistService(code);

  return res.status(200).json(playlist);
}

export async function getInviteTracksController(req, res) {
  const code = parseCode(req.params.code);

  const tracks = await getInviteTracksService(code, req.guest.id);

  return res.status(200).json(tracks);
}

export async function addInviteTrackController(req, res) {
  const code = parseCode(req.params.code);

  const {
    external_track_id,
    spotify_uri,
    title,
    artist,
    image_url,
    duration_ms,
  } = req.body;
  const duration = Number(duration_ms);

  if (
    typeof external_track_id !== "string" || !external_track_id.trim() ||
    typeof title !== "string" || !title.trim() ||
    typeof artist !== "string" || !artist.trim() ||
    !Number.isSafeInteger(duration) || duration <= 0
  ) {
    throw new ErrorHttp(422, "Données de morceau invalides.");
  }

  const track = await addInviteTrackService(code, req.guest.id, {
    external_track_id: external_track_id.trim(),
    spotify_uri: spotify_uri || null,
    title: title.trim(),
    artist: artist.trim(),
    image_url: image_url || null,
    duration_ms: duration,
  });

  return res.status(201).json(track);
}

// Remove a track proposed by the guest behind the invite cookie.
export async function deleteInviteTrackController(req, res) {
  const code = parseCode(req.params.code);

  if (!/^\d+$/.test(req.params.trackId)) {
    throw new ErrorHttp(404, "Morceau introuvable.");
  }

  const track = await deleteInviteTrackService(code, req.guest.id, req.params.trackId);

  return res.status(200).json(track);
}

export async function joinPlaylistController(req, res) {
  const code = parseCode(req.params.code);
  const { guest_name } = req.body;

  if (
    typeof guest_name !== "string" ||
    !guest_name.trim() ||
    guest_name.trim().length > 50
  ) {
    throw new ErrorHttp(422, "Pseudo invalide.");
  }

  const { guest, guestToken } = await joinPlaylistService(code, guest_name);

  // The cookie name contains the code: a browser can join several playlists
  // without mixing them up.
  res.cookie(`guest_${code}`, guestToken, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });

  return res.status(201).json(guest);
}
