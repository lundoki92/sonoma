import { request } from "./http.js";

// Tous les appels du chemin invité (aucun compte, juste le code d'invitation).

// Nom, date, hôte et statut de la soirée : c'est ce qui permet à l'invité de
// reconnaître où il met les pieds avant de donner un pseudo.
export const getInvitation = (code) => request(`/invite/${code}`);

export const joinInvitation = (code, guestName) =>
  request(`/invite/${code}/join`, {
    method: "POST",
    body: { guest_name: guestName },
  });

// Les morceaux proposés par cet invité.
export const listInvitationTracks = (code) => request(`/invite/${code}/tracks`);

export const addInvitationTrack = (code, track) =>
  request(`/invite/${code}/tracks`, { method: "POST", body: track });

export const removeInvitationTrack = (code, trackId) =>
  request(`/invite/${code}/tracks/${trackId}`, { method: "DELETE" });
