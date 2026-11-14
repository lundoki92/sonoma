import { randomUUID } from "node:crypto";
import { ErrorHttp } from "../errors.js";
import {
  createActivePlaylistWithTracksModel,
  getPlaylistsByHostIdModel,
  getPlaylistByIdAndHostModel,
  normalizeLegacyPartyModel,
  updatePlaylistByIdAndHostModel,
} from "../models/playlistModel.js";

// Create a party and open it in the same movement: there is no draft state
// any more, the invitation link is live as soon as the wizard is validated.
// The first tracks are inserted in the same transaction, so a party never
// exists half-built.
export async function createPlaylistService(
  name,
  date_time,
  host_id,
  streaming_service = "spotify",
  tracks = [],
) {
  // Generate a unique invitation code for the playlist.
  const inviteCode = randomUUID();

  try {
    // Normalize the playlist name before storing it in the database.
    return await createActivePlaylistWithTracksModel(
      name.trim(),
      date_time,
      host_id,
      inviteCode,
      streaming_service,
      tracks,
    );
  } catch (error) {
    // 23505: a track was offered twice inside the same submission.
    if (error.code === "23505") {
      throw new ErrorHttp(409, "Un morceau a été proposé deux fois.");
    }

    throw error;
  }
}

// Retrieve every party owned by the host, with their counters.
// Reading the dashboard is also the moment where leftover rows from the old
// draft system are brought to the new model, so nobody has to run SQL.
export async function getPlaylistsByHostService(hostId) {
  await normalizeLegacyPartyModel(hostId);

  return getPlaylistsByHostIdModel(hostId);
}

// A single playlist, only if it belongs to the host.
export async function getPlaylistByIdService(id, hostId) {
  await normalizeLegacyPartyModel(hostId);

  const playlist = await getPlaylistByIdAndHostModel(id, hostId);

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  return playlist;
}

// Update the editable fields of a playlist owned by the host.
export async function updatePlaylistService(id, hostId, {
  name,
  date_time,
  streaming_service,
}) {
  const playlist = await updatePlaylistByIdAndHostModel(id, hostId, {
    name,
    date_time,
    streaming_service,
  });

  if (!playlist) throw new ErrorHttp(404, "Soirée introuvable.");

  return playlist;
}
