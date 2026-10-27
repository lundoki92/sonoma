import express from "express";
import cors from "cors";
import musicRoute from "../routes/musicRoute.js";
import playlistRoute from "../routes/playlistRoute.js";


const app = express()
app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173"
}));

 app.use('/api/playlists', playlistRoute)
 app.use('/api/music', musicRoute)

app.listen(process.env.PORT);