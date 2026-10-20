import { Router } from "express";
import { searchMusic } from "../controllers/musicController.js";

const musicRoute = Router();

musicRoute.get("/search", searchMusic);

export default musicRoute;
