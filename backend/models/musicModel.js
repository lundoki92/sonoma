export const formatTracks = (tracks) => {
  if (!Array.isArray(tracks)) {
    throw new Error("Invalid Spotify tracks response");
  }

  return tracks.map((track) => ({
    external_track_id: track.spotifyId,
    uri: track.uri,
    title: track.title,
    artist: track.artist,
    image_url: track.cover,
    duration_ms: track.durationMs,
  }));
};
