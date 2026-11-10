import { findGuestByTokenAndCodeModel } from "../models/inviteModel.js";
import { ErrorHttp } from '../errors.js';

export async function guestAuth(req, res, next) {
  try {
    const cookieName = "guest_" + req.params.code;
    const token = req.cookies?.[cookieName];
    if (!token) throw new ErrorHttp(401, 'Connexion requise');

    const guest = await findGuestByTokenAndCodeModel(token, req.params.code);
    if (!guest) throw new ErrorHttp(401, 'Connexion requise');

    req.guest = guest;
    next();
  } catch (error) {
    console.error("guestAuth error:", error);
    res.status(500).json({ error: "Server error" });
  }
}