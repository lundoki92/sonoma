// Temporary client-side storage for the playlist creation wizard.
// Nothing is written to the database until step 2 is validated.
const STORAGE_KEY = "sonoma:playlist-draft";

export function readPlaylistDraft() {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function savePlaylistDraft(draft) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Session storage can be unavailable in private mode; the router state
    // still carries the draft in that case.
  }
}

export function clearPlaylistDraft() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clean up if session storage is unavailable.
  }
}
