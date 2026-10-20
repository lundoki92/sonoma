import express from "express";
import {
  createPlaylist,
  getPlaylistById,
  getPlaylistTracks,
  addTrackToPlaylist,
} from "../controllers/playlistController.js";

const playlistRoute = express.Router();

playlistRoute.post("/", createPlaylist);
playlistRoute.get("/:id", getPlaylistById);
playlistRoute.get("/:id/tracks", getPlaylistTracks);
playlistRoute.post("/:id/tracks", addTrackToPlaylist);

export default playlistRoute;
