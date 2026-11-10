import express from "express";
import {
  createPlaylistController,
  getPlaylistByIdController,
} from "../controllers/playlistController.js";
import { auth } from '../middlewares/auth.js'

const routePlaylist = express.Router();

// Create a new playlist.
routePlaylist.post("/", auth, createPlaylistController);

// Retrieve a playlist by its ID.
routePlaylist.get("/:id", getPlaylistByIdController);

export default routePlaylist;
