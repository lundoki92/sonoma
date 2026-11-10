// Tous les appels à l'API d'authentification, au même endroit.
// Chaque fonction renvoie les données, ou lance une erreur qui porte le status et les erreurs par champ.

async function call(path, options = {}) {
  const res = await fetch(`/api/auth${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message ?? "Erreur inattendue");
    error.status = res.status;
    error.errors = data.errors ?? {};
    throw error;
  }
  return data;
}

export const registered = (infos) =>
  call("/register", { method: "POST", body: JSON.stringify(infos) });

export const loggedin = (id) =>
  call("/login", { method: "POST", body: JSON.stringify(id) });

export const loggedout = () => call("/logout", { method: "POST" });

export const myProfile = () => call("/myprofile");
