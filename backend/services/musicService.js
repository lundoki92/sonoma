import { searchSpotifyTracks } from "./spotifyService.js";
import { formatTracks } from "../models/musicModel.js";

export const searchMusicService = async (query) => {
  const tracks = await searchSpotifyTracks(query);

  return formatTracks(tracks);
};
