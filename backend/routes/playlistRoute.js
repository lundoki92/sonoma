import express from "express";
import {
  createPlaylistController,
  getPlaylistByIdController,
} from "../controllers/playlistController.js";

const routePlaylist = express.Router();

// Create a new playlist.
routePlaylist.post("/", createPlaylistController);

// Retrieve a playlist by its ID.
routePlaylist.get("/:id", getPlaylistByIdController);

export default routePlaylist;