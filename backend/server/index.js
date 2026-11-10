import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import musicRoute from "../routes/musicRoute.js";
import playlistRoute from "../routes/playlistRoute.js";
import trackRoute from "../routes/trackRoute.js";
import voteRoute from "../routes/voteRoute.js";
import db from './db.js';
import { authRouter } from '../routes/authRoute.js';
import { errorsManagement } from '../middlewares/errors.js';
export const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());
app.use(cookieParser());        // lit les cookies → req.cookies


// Allow requests from the frontend running on Vite.
app.use(
  cors({
    origin: "http://127.0.0.1:5173",
  }),
);

// Register playlist endpoints.
// Example: POST /api/playlists
// Example: GET /api/playlists/12
app.use("/api/playlists", playlistRoute);

// Register track endpoints under the same base URL.
// Example: GET /api/playlists/12/tracks
// Example: POST /api/playlists/12/tracks
app.use("/api/playlists", trackRoute);

// Register music-related endpoints.
// Example: /api/music/...
app.use("/api/music", musicRoute);

// Register vote endpoints under the playlist base URL.
// GET  /api/playlists/12/voting-tracks
// POST /api/playlists/12/tracks/34/vote
// POST /api/playlists/12/tracks/34/guest-vote
app.use("/api/playlists", voteRoute);

// Start the Express server on the configured port.
app.listen(process.env.PORT);

app.use('/api/auth', authRouter);

app.use(errorsManagement);        