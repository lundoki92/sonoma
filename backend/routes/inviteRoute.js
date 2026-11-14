import express from "express";
import { guestAuth } from "../middlewares/guestAuth.js";
import {
  getInvitePlaylistController,
  getInviteTracksController,
  addInviteTrackController,
  deleteInviteTrackController,
  joinPlaylistController,
} from "../controllers/inviteController.js";

const inviteRoute = express.Router();

// Public: the guest only needs the code to see the name and join
inviteRoute.get("/:code", getInvitePlaylistController);
inviteRoute.post("/:code/join", joinPlaylistController);

// Reserved to guests who have joined
inviteRoute.get("/:code/tracks", guestAuth, getInviteTracksController);
inviteRoute.post("/:code/tracks", guestAuth, addInviteTrackController);
inviteRoute.delete(
  "/:code/tracks/:trackId",
  guestAuth,
  deleteInviteTrackController,
);

export default inviteRoute;