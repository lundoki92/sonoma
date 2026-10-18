
/*
 * SERVICE SPOTIFY
 *
 * Ce fichier permet :
 * 1. De récupérer un token Spotify
 * 2. De conserver ce token en cache
 * 3. De rechercher des musiques via l'API Spotify
 */

// ========================================
// 1. VARIABLES POUR LE CACHE
// ========================================

// Contiendra le token récupéré auprès de Spotify.
// Au démarrage, aucun token n'est disponible.
let cachedToken = null;

// Date à laquelle le token doit être renouvelé.
// 0 signifie qu'aucun token valide n'est en cache.
let tokenExpiresAt = 0;


// ========================================
// 2. RÉCUPÉRER LE TOKEN SPOTIFY
// ========================================

export async function getSpotifyAppToken() {

  // ÉTAPE A : vérifier si un token valide existe.
  // Date.now() renvoie la date actuelle
  // en millisecondes.
  if (cachedToken && Date.now() < tokenExpiresAt) {

    // Le token est encore valide :
    // inutile de contacter Spotify.
    return cachedToken;
  }

  // ÉTAPE B : récupérer les identifiants
  // de notre application depuis le fichier .env.
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Vérifier que les identifiants existent.
  if (!clientId || !clientSecret) {
    throw new Error(
      "Client ID ou Client Secret Spotify manquant"
    );
  }

  // ÉTAPE C : préparer les identifiants.
  //
  // Spotify demande une authentification Basic :
  // Client ID + ":" + Client Secret,
  // puis encodage en Base64.
  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  // ÉTAPE D : demander un access token à Spotify.
  //
  // URL officielle :
  // https://accounts.spotify.com/api/token
  //
  // POST : nous envoyons des informations
  // pour obtenir un token.
  const response = await fetch(
    "https://accounts.spotify.com/api/token",
    {
      method: "POST",

      headers: {
        // Identifiants de notre application
        Authorization: `Basic ${credentials}`,

        // Format attendu par Spotify
        "Content-Type": "application/x-www-form-urlencoded"
      },

      body: new URLSearchParams({
        // Nous utilisons les identifiants
        // de l'application, pas ceux d'un utilisateur.
        grant_type: "client_credentials"
      })
    }
  );

  // ÉTAPE E : vérifier la réponse de Spotify.
  //
  // response.ok vaut true pour un statut 2xx.
  if (!response.ok) {
    throw new Error(
      `Erreur lors de l'authentification Spotify : ${response.status}`
    );
  }

  // ÉTAPE F : convertir la réponse en JSON.
  //
  // Spotify renvoie notamment :
  // access_token : le token
  // token_type : Bearer
  // expires_in : durée de validité en secondes
  const data = await response.json();

  // ÉTAPE G : enregistrer le token en cache.
  cachedToken = data.access_token;

  // ÉTAPE H : calculer sa date d'expiration.
  //
  // Date.now() : millisecondes
  // expires_in : secondes
  //
  // On multiplie par 1000 pour convertir.
  // On retire 60 secondes de sécurité pour
  // renouveler le token un peu avant son expiration.
  tokenExpiresAt =
    Date.now() + Math.max(0, data.expires_in - 60) * 1000;

  // ÉTAPE I : renvoyer le token.
  return cachedToken;
}


// ========================================
// 3. RECHERCHER DES MUSIQUES
// ========================================

export async function searchSpotifyTracks(query) {

  // ÉTAPE A : récupérer un token valide.
  //
  // Si le token est en cache, il sera réutilisé.
  // Sinon, getSpotifyAppToken() en demandera un.
  const token = await getSpotifyAppToken();

  // ÉTAPE B : préparer les paramètres de recherche.
  //
  // q : texte recherché
  // type : track = morceau
  // limit : nombre maximum de résultats
  // market : marché français
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "5",
    market: "FR"
  });

  // ÉTAPE C : construire l'URL Spotify.
  //
  // Exemple :
  // https://api.spotify.com/v1/search?q=Daft+Punk&type=track&limit=10&market=FR
  const url = `https://api.spotify.com/v1/search?${params}`;

  // ÉTAPE D : envoyer la requête GET à Spotify.
  //
  // Le token est envoyé dans Authorization
  // avec le préfixe Bearer.
  const response = await fetch(url, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  // ÉTAPE E : vérifier si Spotify a accepté
  // notre requête.
  if (!response.ok) {
    throw new Error(
      `Erreur lors de la recherche Spotify : ${response.status}`
    );
  }

  // ÉTAPE F : convertir la réponse en JSON.
  const data = await response.json();

  // ÉTAPE G : récupérer les morceaux.
  //
  // Spotify place les résultats dans :
  // data.tracks.items
  const tracks = data.tracks?.items ?? [];

  // ÉTAPE H : garder seulement les informations
  // dont notre application a besoin.
  return tracks.map((track) => ({

    // Identifiant unique du morceau sur Spotify.
    // Utile pour identifier précisément la musique.
    spotifyId: track.id,

    // URI Spotify.
    // Utile plus tard pour lancer la lecture.
    // Exemple : spotify:track:xxxxxxxx
    uri: track.uri,

    // Nom de la musique.
    title: track.name,

    // Nom des artistes.
    //
    // Certains morceaux ont plusieurs artistes.
    // map() récupère leurs noms.
    // join(", ") les rassemble dans une chaîne.
    artist: track.artists
      .map((artist) => artist.name)
      .join(", "),

    // URL de l'image de couverture de l'album.
    //
    // images[0] correspond généralement
    // à la plus grande image disponible.
    // Si aucune image n'existe, on renvoie null.
    cover: track.album.images[0]?.url ?? null,

    // Durée du morceau en millisecondes.
    // Exemple : 180000 = 3 minutes.
    durationMs: track.duration_ms
  }));
}
