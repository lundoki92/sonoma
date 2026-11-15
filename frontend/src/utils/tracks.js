// Turn a Spotify search result into the payload expected by the API.
// Shared by the creation step and the party "Proposer" screen.
export function normalizeTrack(track) {
  const externalId = track.spotifyId ?? track.external_track_id;

  const artist = track.artist
    ? track.artist
    : Array.isArray(track.artists)
      ? track.artists.map((item) => item.name).join(", ")
      : "";

  return {
    external_track_id: externalId,
    spotify_uri:
      track.uri ??
      track.spotify_uri ??
      (externalId ? `spotify:track:${externalId}` : null),
    title: track.title ?? track.name,
    artist,
    image_url: track.cover ?? track.image_url ?? null,
    duration_ms: track.durationMs ?? track.duration_ms,
  };
}

// Est-ce le programme du début de soirée ?
//
// Le seul signal que la base connaît est le statut écrit à l'insertion :
// « preparing » donne proposed, sinon voting. Ce statut porte déjà le vote,
// on ne lui demande donc pas de porter l'origine tout seul : une chanson
// « proposed » n'est un morceau de lancement que si c'est l'hôte qui l'a
// ajoutée, avant d'ouvrir sa soirée. La proposition d'un invité faite le
// même jour reste une simple proposition.
export function isOpeningTrack(track) {
  return track.status === "proposed" && track.guest_id === null;
}
