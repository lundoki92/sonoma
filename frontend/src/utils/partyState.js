// État d'une soirée, tel qu'il doit être affiché à l'écran.
//
// Deux questions comptent au dashboard : la soirée est-elle ouverte, et son
// jour est-il passé ? Le statut technique répond à la première, la date à la
// seconde.
const STATES = {
  live: { key: "live", label: "En direct", badge: "live" },
  preparing: { key: "preparing", label: "En préparation", badge: "preparing" },
  past: { key: "past", label: "Terminée", badge: "past" },
  unknown: { key: "unknown", label: "Inconnue", badge: "unknown" },
};

// Ordre d'affichage sur le dashboard : ce qui se joue, puis ce qui est joué.
export const STATE_ORDER = ["live", "preparing", "past", "unknown"];

// Même jour calendaire, à la date locale près.
function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// `now` est injectable pour pouvoir tester l'état sans changer l'horloge.
export function getPartyState(playlist, now = new Date()) {
  if (!playlist) return STATES.unknown;

  // Le statut prime sur la date : une soirée jamais ouverte reste en
  // préparation, même si son jour est passé.
  if (playlist.status === "preparing") return STATES.preparing;

  // Soirée close explicitement : terminée, quel que soit son jour.
  if (playlist.status === "finished") return STATES.past;

  // Un statut qu'on n'attend plus : on l'affiche comme inconnu plutôt que de
  // le faire passer pour une soirée ouverte.
  if (playlist.status !== "active") return STATES.unknown;

  const startsAt = new Date(playlist.date_time);
  const currentAt = new Date(now);

  // Date illisible : on reste sur le statut technique.
  if (Number.isNaN(startsAt.getTime())) return STATES.live;

  // Le jour est passé : la soirée a eu lieu.
  if (startsAt < currentAt && !isSameDay(startsAt, currentAt)) return STATES.past;

  return STATES.live;
}

// Une soirée terminée est de l'historique : on la lit sur la carte, on ne
// l'ouvre plus. Une soirée en préparation reste ouvrable pour la finir.
export function isPartyActionable(playlist, now = new Date()) {
  const { key } = getPartyState(playlist, now);

  return key === "live" || key === "preparing";
}
