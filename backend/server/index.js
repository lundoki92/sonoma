import express from "express";
import cors from "cors";

import routePlaylist from "./routes/playlist.js";


const app = express()
app.use(cors())

 app.use('/', routePlaylist)

app.listen(process.env.PORT);