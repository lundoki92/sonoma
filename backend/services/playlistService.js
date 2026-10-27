//règles métiers
import { randomUUID } from "node:crypto";
import createPlaylistModel from "../models/playlistModel.js";

async function createPlaylistService(name, date_time) {
    //temporary host_id for testing
  const hostId = 2;
  //create a random invite code
  const inviteCode = randomUUID();

  return await createPlaylistModel(
    name.trim(),
    date_time,
    hostId,
    inviteCode
  );
}

export default createPlaylistService;