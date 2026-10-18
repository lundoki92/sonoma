import express from "express";
import cors from "cors";
import routeMusic from "./routes/routeMusic.js";
import routePlaylist from "./routes/playlist.js";


const app = express()
app.use(express.json());
app.use(cors({
  origin: "http://127.0.0.1:5173"
}));

 app.use('/', routePlaylist)
 app.use('/api/music', routeMusic)

app.listen(process.env.PORT);