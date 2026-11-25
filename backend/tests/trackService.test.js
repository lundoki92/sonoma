
import { jest } from "@jest/globals";

// mocks model
const getPlaylistStatusForHostModel = jest.fn();
const getHostTracksByPlaylistModel = jest.fn();
const addTrackToPlaylistModel = jest.fn();

jest.unstable_mockModule("../models/trackModel.js", () => ({
  getPlaylistStatusForHostModel,
  getHostTracksByPlaylistModel,
  addTrackToPlaylistModel,
}));

// import service after mock
const {
  getTracksByPlaylistService,
  addTrackToPlaylistService,
} = await import("../services/trackService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// GET TRACKS BY PLAYLIST
describe("getTracksByPlaylistService", () => {
  test("should return tracks when the playlist exists", async () => {
    const tracks = [
      { id: 1, title: "Song 1" },
      { id: 2, title: "Song 2" },
    ];

    getPlaylistStatusForHostModel.mockResolvedValue({
      status: "preparing",
    });

    getHostTracksByPlaylistModel.mockResolvedValue(tracks);

    const result = await getTracksByPlaylistService(1, 2);

    expect(getPlaylistStatusForHostModel).toHaveBeenCalledWith(1, 2);
    expect(getHostTracksByPlaylistModel).toHaveBeenCalledWith(1);
    expect(result).toEqual(tracks);
  });

  test("should throw a 404 error when the playlist does not exist", async () => {
    getPlaylistStatusForHostModel.mockResolvedValue(null);

    await expect(
      getTracksByPlaylistService(1, 2)
    ).rejects.toMatchObject({
      message: "Playlist not found",
      statusCode: 404,
    });

    expect(getHostTracksByPlaylistModel).not.toHaveBeenCalled();
  });
});

// ADD TRACK TO PLAYLIST
describe("addTrackToPlaylistService", () => {
  const trackData = {
    external_track_id: "spotify123",
    spotify_uri: "spotify:track:123",
    title: "Test song",
    artist: "Test artist",
    image_url: "https://example.com/image.jpg",
    duration_ms: 180000,
  };

  test("should throw a 404 error when the playlist does not exist", async () => {
    getPlaylistStatusForHostModel.mockResolvedValue(null);

    await expect(
      addTrackToPlaylistService(1, 2, trackData)
    ).rejects.toMatchObject({
      message: "Playlist not found",
      statusCode: 404,
    });

    expect(addTrackToPlaylistModel).not.toHaveBeenCalled();
  });

  test("should throw a 400 error when the playlist is finished", async () => {
    getPlaylistStatusForHostModel.mockResolvedValue({
      status: "finished",
    });

    await expect(
      addTrackToPlaylistService(1, 2, trackData)
    ).rejects.toMatchObject({
      message: "This playlist is finished",
      statusCode: 400,
    });

    expect(addTrackToPlaylistModel).not.toHaveBeenCalled();
  });

  test("should add a track with proposed status when the playlist is preparing", async () => {
    const newTrack = { id: 1, ...trackData, status: "proposed" };

    getPlaylistStatusForHostModel.mockResolvedValue({
      status: "preparing",
    });

    addTrackToPlaylistModel.mockResolvedValue(newTrack);

    const result = await addTrackToPlaylistService(1, 2, trackData);

    expect(addTrackToPlaylistModel).toHaveBeenCalledWith(
      1,
      trackData,
      "proposed"
    );

    expect(result).toEqual(newTrack);
  });

  test("should add a track with voting status when the playlist is not preparing", async () => {
    const newTrack = { id: 1, ...trackData, status: "voting" };

    getPlaylistStatusForHostModel.mockResolvedValue({
      status: "voting",
    });

    addTrackToPlaylistModel.mockResolvedValue(newTrack);

    const result = await addTrackToPlaylistService(1, 2, trackData);

    expect(addTrackToPlaylistModel).toHaveBeenCalledWith(
      1,
      trackData,
      "voting"
    );

    expect(result).toEqual(newTrack);
  });
});
