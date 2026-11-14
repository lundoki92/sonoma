import { request } from "./http.js";

// Recherche dans le catalogue Spotify, côté serveur (les clés restent dans
// le backend). Le front n'a plus d'URL absolute à connaître.
export const searchTracks = async (query) => {
  const data = await request(
    `/music/search?q=${encodeURIComponent(query.trim())}`,
  );

  // Le service renvoie déjà une liste ; on tolère les enveloppes éventuelles.
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tracks)) return data.tracks;

  return data?.tracks?.items ?? [];
};
