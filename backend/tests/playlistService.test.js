
import { jest } from "@jest/globals";

// mocks model
const createPlaylistModel = jest.fn();
const getPlaylistsByHostIdModel = jest.fn();
const getPlaylistByIdAndHostModel = jest.fn();

jest.unstable_mockModule("../models/playlistModel.js", () => ({
  createPlaylistModel,
  getPlaylistsByHostIdModel,
  getPlaylistByIdAndHostModel,
}));

// import service after mocks
const {
  createPlaylistService,
  getPlaylistsByHostService,
  getPlaylistByIdService,
} = await import("../services/playlistService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

// CREATE PLAYLIST
describe("createPlaylistService", () => {
  test("should create a playlist with a trimmed name and an invite code", async () => {
    const playlist = { id: 1, name: "Soirée test" };

    createPlaylistModel.mockResolvedValue(playlist);

    const result = await createPlaylistService(
      "  Soirée test  ",
      "2026-12-01",
      1
    );

    expect(createPlaylistModel).toHaveBeenCalledTimes(1);

    const [name, dateTime, hostId, inviteCode] =
      createPlaylistModel.mock.calls[0];

    expect(name).toBe("Soirée test");
    expect(dateTime).toBe("2026-12-01");
    expect(hostId).toBe(1);
    expect(inviteCode).toEqual(expect.any(String));

    expect(result).toEqual(playlist);
  });

  test("should propagate an error when playlist creation fails", async () => {
    const error = new Error("Database error");

    createPlaylistModel.mockRejectedValue(error);

    await expect(
      createPlaylistService("  Soirée test  ", "2026-12-01", 1)
    ).rejects.toThrow("Database error");
  });
});

// GET PLAYLISTS BY HOST
describe("getPlaylistsByHostService", () => {
  test("should return all playlists belonging to a host", async () => {
    const playlists = [
      { id: 1, name: "Soirée 1" },
      { id: 2, name: "Soirée 2" },
    ];

    getPlaylistsByHostIdModel.mockResolvedValue(playlists);

    const result = await getPlaylistsByHostService(1);

    expect(getPlaylistsByHostIdModel).toHaveBeenCalledWith(1);
    expect(result).toEqual(playlists);
  });
});

// GET PLAYLIST BY ID
describe("getPlaylistByIdService", () => {
  test("should return a playlist belonging to a host", async () => {
    const playlist = { id: 1, name: "Soirée test" };

    getPlaylistByIdAndHostModel.mockResolvedValue(playlist);

    const result = await getPlaylistByIdService(1, 2);

    expect(getPlaylistByIdAndHostModel).toHaveBeenCalledWith(1, 2);
    expect(result).toEqual(playlist);
  });

  test("should return null when the playlist does not exist or does not belong to the host", async () => {
    getPlaylistByIdAndHostModel.mockResolvedValue(null);

    const result = await getPlaylistByIdService(99, 2);

    expect(getPlaylistByIdAndHostModel).toHaveBeenCalledWith(99, 2);
    expect(result).toBeNull();
  });
});
