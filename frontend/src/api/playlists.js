import { request } from "./http.js";

// Tous les appels aux soirées d'un hôte, au même endroit.

// La liste du dashboard, avec les compteurs morceaux / invités.
export const listPlaylists = () => request("/playlists");

// Une soirée, avec ses compteurs.
export const getPlaylist = (id) => request(`/playlists/${id}`);

// Créer une soirée ET l'ouvrir : c'est la validation de la dernière étape
// du wizard, il n'existe plus d'écriture intermédiaire en base.
export const createPlaylist = ({ name, date_time, streaming_service, tracks }) =>
  request("/playlists", {
    method: "POST",
    body: { name, date_time, streaming_service, tracks },
  });

// Modifier les champs éditables d'une soirée déjà ouverte.
export const updatePlaylist = (id, fields) =>
  request(`/playlists/${id}`, { method: "PATCH", body: fields });

// Morceaux ajoutés par l'hôte.
export const listHostTracks = (id) => request(`/playlists/${id}/tracks`);

export const addHostTrack = (id, track) =>
  request(`/playlists/${id}/tracks`, { method: "POST", body: track });

export const removeHostTrack = (id, trackId) =>
  request(`/playlists/${id}/tracks/${trackId}`, { method: "DELETE" });
