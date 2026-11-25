
import { jest } from "@jest/globals";

const createPlaylistMock = jest.fn();
const getPlaylistByIdMock = jest.fn();
const getPlaylistsByHostMock = jest.fn();

jest.unstable_mockModule("../services/playlistService.js", () => ({
  createPlaylistService: createPlaylistMock,
  getPlaylistByIdService: getPlaylistByIdMock,
  getPlaylistsByHostService: getPlaylistsByHostMock,
}));

const {
  createPlaylistController,
  getPlaylistByIdController,
  getMyPlaylistsController,
} = await import("../controllers/playlistController.js");

describe("playlistController", () => {
  let req;
  let res;

  beforeEach(() => {
    createPlaylistMock.mockReset();
    getPlaylistByIdMock.mockReset();
    getPlaylistsByHostMock.mockReset();

    req = {
      body: {
        name: "Birthday Party",
        date_time: "2026-11-24T20:00:00",
      },
      params: {
        id: "1",
      },
      user: {
        id: 42,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------- CREATE PLAYLIST ----------

  describe("createPlaylistController", () => {
    test("should return 400 if the playlist name is invalid", async () => {
      req.body.name = "   ";

      await createPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid playlist name",
      });

      expect(createPlaylistMock).not.toHaveBeenCalled();
    });

    test("should return 400 if the playlist name exceeds 100 characters", async () => {
      req.body.name = "A".repeat(101);

      await createPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid playlist name",
      });

      expect(createPlaylistMock).not.toHaveBeenCalled();
    });

    test("should return 400 if the playlist date is invalid", async () => {
      req.body.date_time = "not-a-date";

      await createPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid playlist date",
      });

      expect(createPlaylistMock).not.toHaveBeenCalled();
    });

    test("should return 400 if the host ID is invalid", async () => {
      req.user.id = -1;

      await createPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid host ID",
      });

      expect(createPlaylistMock).not.toHaveBeenCalled();
    });

    test("should create a playlist successfully", async () => {
      const playlist = {
        id: 1,
        name: "Birthday Party",
        date_time: "2026-11-24T20:00:00",
        host_id: 42,
      };

      createPlaylistMock.mockResolvedValue(playlist);

      await createPlaylistController(req, res);

      expect(createPlaylistMock).toHaveBeenCalledWith(
        "Birthday Party",
        "2026-11-24T20:00:00",
        42
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(playlist);
    });

    test("should return 500 if the creation service fails", async () => {
      createPlaylistMock.mockRejectedValue(
        new Error("Database error")
      );

      await createPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to create playlist",
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  // ---------- GET PLAYLIST BY ID ----------

  describe("getPlaylistByIdController", () => {
    test("should return 400 if the playlist ID is invalid", async () => {
      req.params.id = "abc";

      await getPlaylistByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid playlist ID",
      });

      expect(getPlaylistByIdMock).not.toHaveBeenCalled();
    });

    test("should return 404 if the playlist does not exist", async () => {
      getPlaylistByIdMock.mockResolvedValue(null);

      await getPlaylistByIdController(req, res);

      expect(getPlaylistByIdMock).toHaveBeenCalledWith("1", 42);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist not found",
      });
    });

    test("should return the requested playlist", async () => {
      const playlist = {
        id: 1,
        name: "Birthday Party",
      };

      getPlaylistByIdMock.mockResolvedValue(playlist);

      await getPlaylistByIdController(req, res);

      expect(getPlaylistByIdMock).toHaveBeenCalledWith("1", 42);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(playlist);
    });

    test("should return 500 if the retrieval service fails", async () => {
      getPlaylistByIdMock.mockRejectedValue(
        new Error("Database error")
      );

      await getPlaylistByIdController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch playlist",
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  // ---------- GET MY PLAYLISTS ----------

  describe("getMyPlaylistsController", () => {
    test("should return the host's playlists", async () => {
      const playlists = [
        { id: 1, name: "Birthday Party" },
        { id: 2, name: "Summer Party" },
      ];

      getPlaylistsByHostMock.mockResolvedValue(playlists);

      await getMyPlaylistsController(req, res);

      expect(getPlaylistsByHostMock).toHaveBeenCalledWith(42);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(playlists);
    });

    test("should return an empty array if the host has no playlists", async () => {
      getPlaylistsByHostMock.mockResolvedValue([]);

      await getMyPlaylistsController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("should return 500 if the retrieval service fails", async () => {
      getPlaylistsByHostMock.mockRejectedValue(
        new Error("Database error")
      );

      await getMyPlaylistsController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch playlists",
      });

      expect(console.error).toHaveBeenCalled();
    });
  });
});
