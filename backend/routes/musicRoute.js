
import { Router } from "express";
import { searchSpotifyTracksController } from "../controllers/musicController.js";

const musicRoute = Router();

// Search for tracks in the Spotify catalog.
musicRoute.get("/search", searchSpotifyTracksController);

export default musicRoute;
