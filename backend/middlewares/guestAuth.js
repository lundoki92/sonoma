import { findGuestByTokenAndCodeModel } from "../models/inviteModel.js";
import { ErrorHttp } from '../errors.js'

// Identifie l'invité derrière son cookie d'invitation.
// Un cookie absent est un problème d'authentification, pas un plantage : on
// répond 401 et le front renvoie l'invité vers la page de rejoindre.
export async function guestAuth(req, res, next) {
  const cookieName = "guest_" + req.params.code;
  const token = req.cookies?.[cookieName];

  if (!token) {
    return next(new ErrorHttp(401, 'Connexion requise'));
  }

  try {
    const guest = await findGuestByTokenAndCodeModel(token, req.params.code);

    if (!guest) {
      return next(new ErrorHttp(401, 'Connexion requise'));
    }

    req.guest = guest;
    return next();
  } catch (error) {
    console.error("guestAuth error:", error);
    return next(new ErrorHttp(500, 'Erreur côté serveur'));
  }
}
