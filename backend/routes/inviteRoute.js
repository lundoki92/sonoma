import express from "express";
import {
  getInvitePlaylistController,
  getInviteTracksController,
  addInviteTrackController,
} from "../controllers/inviteController.js";

const inviteRoute = express.Router();

// No auth here: access is granted by the invite code
inviteRoute.get("/:code", getInvitePlaylistController);
inviteRoute.get("/:code/tracks", getInviteTracksController);
inviteRoute.post("/:code/tracks", addInviteTrackController);

export default inviteRoute;