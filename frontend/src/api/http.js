// Couche d'accès à l'API : le seul endroit du front qui connaît les URL,
// les verbes HTTP et la forme des erreurs du backend.
//
// Le backend répond via son middleware d'erreurs : `{ message, erreurs }`.
// `request()` normalise ça en une Error JavaScript portant `status` et
// `errors`, pour que les pages n'aient plus jamais à lire `response.ok`.

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors ?? {};
  }
}

export async function request(path, { method = "GET", body } = {}) {
  const options = {
    method,
    headers: {},
  };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  // `credentials: 'include'` est inutile en same-origin derrière le proxy
  // Vite, mais les cookies de session et d'invitation doivent voyager.
  options.credentials = "include";

  let response;

  try {
    response = await fetch(`/api${path}`, options);
  } catch {
    throw new ApiError("Le serveur ne répond pas.", 0);
  }

  // 204 : la ressource a disparu, il n'y a pas de corps à lire.
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message ?? data?.error ?? "Une erreur est survenue.",
      response.status,
      data?.erreurs ?? data?.errors,
    );
  }

  return data;
}
