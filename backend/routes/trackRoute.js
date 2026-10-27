import express from "express";
import {
  getTracksByPlaylistController,
  addTrackToPlaylistController,
} from "../controllers/trackController.js";

const trackRoute = express.Router();

// Retrieve all tracks belonging to a playlist.
trackRoute.get(
  "/:playlistId/tracks",
  getTracksByPlaylistController
);

// Add a new track to a playlist.
trackRoute.post(
  "/:playlistId/tracks",
  addTrackToPlaylistController
);

export default trackRoute;