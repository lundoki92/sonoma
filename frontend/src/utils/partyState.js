// État d'une soirée, tel qu'il doit être affiché à l'écran.
//
// Deux questions comptent au dashboard : la préparation est-elle terminée,
// et le jour est-il passé ?
const STATES = {
  draft: { key: "draft", label: "Brouillon", badge: "preparing" },
  live: { key: "live", label: "En direct", badge: "live" },
  past: { key: "past", label: "Terminée", badge: "past" },
  archived: { key: "archived", label: "Archivée", badge: "archived" },
  unknown: { key: "unknown", label: "Inconnue", badge: "unknown" },
};

// Ordre d'affichage sur le dashboard : ce qui se joue, puis ce qui est joué.
export const STATE_ORDER = ["live", "draft", "past", "archived", "unknown"];

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

  if (playlist.status === "finished") return STATES.archived;

  // La préparation n'est pas terminée : la soirée n'est pas encore ouverte,
  // mais elle reste à ouvrir pour finir de la créer.
  if (playlist.status === "preparing") return STATES.draft;

  // Un statut qu'on n'attend plus (donnée écrite à la main) : on l'affiche
  // comme inconnu plutôt que de le faire passer pour une soirée ouverte.
  if (playlist.status !== "active") return STATES.unknown;

  const startsAt = new Date(playlist.date_time);
  const currentAt = new Date(now);

  // Date illisible : on reste sur le statut technique.
  if (Number.isNaN(startsAt.getTime())) return STATES.live;

  // Le jour est passé : la soirée a eu lieu.
  if (startsAt < currentAt && !isSameDay(startsAt, currentAt)) return STATES.past;

  return STATES.live;
}

// Une soirée passée ou archivée est de l'historique : on la lit sur la carte,
// on ne l'ouvre plus. Un brouillon reste ouvrable pour finir de le préparer.
export function isPartyActionable(playlist, now = new Date()) {
  const { key } = getPartyState(playlist, now);

  return key === "live" || key === "draft";
}
