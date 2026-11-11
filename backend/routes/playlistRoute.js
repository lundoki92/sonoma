import express from "express";
import {
  createPlaylistController,
  getPlaylistByIdController,
  getMyPlaylistsController,
  updatePlaylistController,
} from "../controllers/playlistController.js";
import { auth } from '../middlewares/auth.js'

const routePlaylist = express.Router();


// HOST 
// Create a new playlist.
routePlaylist.post("/", auth, createPlaylistController);
// Retrieve all playlist 
routePlaylist.get("/", auth, getMyPlaylistsController);
// Retrieve a playlist by its ID.
routePlaylist.get("/:id", auth, getPlaylistByIdController);
// Update the editable fields of a playlist.
routePlaylist.patch("/:id", auth, updatePlaylistController);

// Invité (pas d'auth, accès via le code)
// routePlaylist.get("/invite/:code", getPlaylistByInviteController);
// routePlaylist.get("/invite/:code/tracks", getInviteTracksController);
// routePlaylist.post("/invite/:code/tracks", addInviteTrackController);

export default routePlaylist;
