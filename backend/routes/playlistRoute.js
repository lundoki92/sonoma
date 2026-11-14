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
// Create a party and open it (last step of the wizard).
routePlaylist.post("/", auth, createPlaylistController);
// Retrieve all the host's parties.
routePlaylist.get("/", auth, getMyPlaylistsController);
// Retrieve one party.
routePlaylist.get("/:id", auth, getPlaylistByIdController);
// Update the editable fields of a party.
routePlaylist.patch("/:id", auth, updatePlaylistController);

export default routePlaylist;
