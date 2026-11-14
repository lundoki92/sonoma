// Turn a Spotify search result into the payload expected by the API.
// Shared by the creation step and the party "Propose" screen.
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
