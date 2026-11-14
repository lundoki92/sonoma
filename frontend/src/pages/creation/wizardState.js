// État du wizard de création, en mémoire côté navigateur.
//
// Ce n'est pas un brouillon enregistré : rien n'existe en base avant la
// dernière étape. Ce stockage ne sert qu'à garder le nom, la date et les
// morceaux choisis quand on navigue entre les étapes (bouton retour, refresh).
const STORAGE_KEY = "sonoma:wizard";

export function readWizardState() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveWizardState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Session storage can be unavailable in private mode; the router state
    // still carries the wizard forward in that case.
  }
}

export function clearWizardState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if session storage is unavailable.
  }
}
