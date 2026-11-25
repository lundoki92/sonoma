
import { jest } from "@jest/globals";

// mocks models
const getPlaylistByInviteCodeModel = jest.fn();
const createGuestModel = jest.fn();
const getGuestTracksByPlaylistModel = jest.fn();
const addTrackToPlaylistModel = jest.fn();

jest.unstable_mockModule("../models/playlistModel.js", () => ({
  getPlaylistByInviteCodeModel,
}));

jest.unstable_mockModule("../models/inviteModel.js", () => ({
  createGuestModel,
}));

jest.unstable_mockModule("../models/trackModel.js", () => ({
  getGuestTracksByPlaylistModel,
  addTrackToPlaylistModel,
}));

// Import service after mocks
const {
  getInvitePlaylistService,
  getInviteTracksService,
  addInviteTrackService,
  joinPlaylistService,
} = await import("../services/inviteService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// GET INVITE PLAYLIST
describe("getInvitePlaylistService", () => {
  test("should return the playlist associated with an invite code", async () => {
    const playlist = { id: 1, name: "Soirée test" };

    getPlaylistByInviteCodeModel.mockResolvedValue(playlist);

    const result = await getInvitePlaylistService("invite123");

    expect(getPlaylistByInviteCodeModel).toHaveBeenCalledWith("invite123");
    expect(result).toEqual(playlist);
  });

  test("should throw a 404 error when the playlist is not found", async () => {
    getPlaylistByInviteCodeModel.mockResolvedValue(null);

    await expect(
      getInvitePlaylistService("invalidCode")
    ).rejects.toMatchObject({
      message: "Playlist not found",
      statusCode: 404,
    });
  });
});

// GET INVITE TRACKS
describe("getInviteTracksService", () => {
  test("should return the tracks associated with an invite code", async () => {
    const playlist = { id: 1, status: "preparing" };
    const tracks = [
      { id: 1, title: "Song 1" },
      { id: 2, title: "Song 2" },
    ];

    getPlaylistByInviteCodeModel.mockResolvedValue(playlist);
    getGuestTracksByPlaylistModel.mockResolvedValue(tracks);

    const result = await getInviteTracksService("invite123");

    expect(getPlaylistByInviteCodeModel).toHaveBeenCalledWith("invite123");
    expect(getGuestTracksByPlaylistModel).toHaveBeenCalledWith(1);
    expect(result).toEqual(tracks);
  });

  test("should throw a 404 error when the invite code is invalid", async () => {
    getPlaylistByInviteCodeModel.mockResolvedValue(null);

    await expect(
      getInviteTracksService("invalidCode")
    ).rejects.toMatchObject({
      message: "Playlist not found",
      statusCode: 404,
    });

    expect(getGuestTracksByPlaylistModel).not.toHaveBeenCalled();
  });
});

// ADD INVITE TRACK
describe("addInviteTrackService", () => {
  const trackData = {
    external_track_id: "spotify123",
    spotify_uri: "spotify:track:123",
    title: "Test song",
    artist: "Test artist",
    image_url: "https://example.com/image.jpg",
    duration_ms: 180000,
  };

  test("should add a track with proposed status when the playlist is preparing", async () => {
    const playlist = { id: 1, status: "preparing" };
    const newTrack = { id: 10, ...trackData, status: "proposed" };

    getPlaylistByInviteCodeModel.mockResolvedValue(playlist);
    addTrackToPlaylistModel.mockResolvedValue(newTrack);

    const result = await addInviteTrackService(
      "invite123",
      5,
      trackData
    );

    expect(addTrackToPlaylistModel).toHaveBeenCalledWith(
      1,
      trackData,
      "proposed",
      5
    );

    expect(result).toEqual(newTrack);
  });

  test("should add a track with voting status when the playlist is not preparing", async () => {
    const playlist = { id: 1, status: "voting" };
    const newTrack = { id: 10, ...trackData, status: "voting" };

    getPlaylistByInviteCodeModel.mockResolvedValue(playlist);
    addTrackToPlaylistModel.mockResolvedValue(newTrack);

    const result = await addInviteTrackService(
      "invite123",
      5,
      trackData
    );

    expect(addTrackToPlaylistModel).toHaveBeenCalledWith(
      1,
      trackData,
      "voting",
      5
    );

    expect(result).toEqual(newTrack);
  });

  test("should throw a 400 error when the playlist is finished", async () => {
    getPlaylistByInviteCodeModel.mockResolvedValue({
      id: 1,
      status: "finished",
    });

    await expect(
      addInviteTrackService("invite123", 5, trackData)
    ).rejects.toMatchObject({
      message: "This playlist is finished",
      statusCode: 400,
    });

    expect(addTrackToPlaylistModel).not.toHaveBeenCalled();
  });
});

// JOIN PLAYLIST
describe("joinPlaylistService", () => {
  test("should register a guest and return a guest token", async () => {
    const playlist = { id: 1, status: "preparing" };
    const guest = {
      id: 5,
      playlist_id: 1,
      guest_name: "Alice",
    };

    getPlaylistByInviteCodeModel.mockResolvedValue(playlist);
    createGuestModel.mockResolvedValue(guest);

    const result = await joinPlaylistService(
      "invite123",
      "Alice"
    );

    expect(createGuestModel).toHaveBeenCalledTimes(1);

    const [playlistId, guestName, guestToken] =
      createGuestModel.mock.calls[0];

    expect(playlistId).toBe(1);
    expect(guestName).toBe("Alice");
    expect(guestToken).toEqual(expect.any(String));

    expect(result.guest).toEqual(guest);
    expect(result.guestToken).toBe(guestToken);
  });

  test("should trim the guest name before registration", async () => {
    getPlaylistByInviteCodeModel.mockResolvedValue({
      id: 1,
      status: "preparing",
    });

    createGuestModel.mockResolvedValue({ id: 5 });

    await joinPlaylistService("invite123", "  Alice  ");

    expect(createGuestModel.mock.calls[0][1]).toBe("Alice");
  });

  test("should throw a 400 error when the playlist is finished", async () => {
    getPlaylistByInviteCodeModel.mockResolvedValue({
      id: 1,
      status: "finished",
    });

    await expect(
      joinPlaylistService("invite123", "Alice")
    ).rejects.toMatchObject({
      message: "This playlist is finished",
      statusCode: 400,
    });

    expect(createGuestModel).not.toHaveBeenCalled();
  });
});
