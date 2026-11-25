
import { jest } from "@jest/globals";

const getTracksMock = jest.fn();
const addTrackMock = jest.fn();

jest.unstable_mockModule("../services/trackService.js", () => ({
  getTracksByPlaylistService: getTracksMock,
  addTrackToPlaylistService: addTrackMock,
}));

const {
  getTracksByPlaylistController,
  addTrackToPlaylistController,
} = await import("../controllers/trackController.js");

describe("trackController", () => {
  let req;
  let res;

  beforeEach(() => {
    getTracksMock.mockReset();
    addTrackMock.mockReset();

    req = {
      params: {
        playlistId: "1",
      },
      user: {
        id: 42,
      },
      body: {
        external_track_id: "spotify-track-123",
        spotify_uri: "spotify:track:123",
        title: "Song title",
        artist: "Artist name",
        image_url: "https://example.com/image.jpg",
        duration_ms: 180000,
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

  // ---------- GET TRACKS BY PLAYLIST ----------

  describe("getTracksByPlaylistController", () => {
    test("should return 400 if the playlist ID is invalid", async () => {
      req.params.playlistId = "abc";

      await getTracksByPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid playlist ID",
      });

      expect(getTracksMock).not.toHaveBeenCalled();
    });

    test("should return the playlist tracks", async () => {
      const tracks = [
        { id: 1, title: "Song One" },
        { id: 2, title: "Song Two" },
      ];

      getTracksMock.mockResolvedValue(tracks);

      await getTracksByPlaylistController(req, res);

      expect(getTracksMock).toHaveBeenCalledWith("1", 42);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tracks);
    });

    test("should return an empty array if the playlist has no tracks", async () => {
      getTracksMock.mockResolvedValue([]);

      await getTracksByPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    test("should return the service error status if available", async () => {
      getTracksMock.mockRejectedValue({
        statusCode: 404,
        message: "Playlist not found",
      });

      await getTracksByPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist not found",
      });
    });

    test("should return 500 if an unexpected error occurs", async () => {
      getTracksMock.mockRejectedValue(
        new Error("Database error")
      );

      await getTracksByPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch tracks",
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  // ---------- ADD TRACK TO PLAYLIST ----------

  describe("addTrackToPlaylistController", () => {
    test("should return 400 if the playlist ID is invalid", async () => {
      req.params.playlistId = "abc";

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid playlist ID",
      });

      expect(addTrackMock).not.toHaveBeenCalled();
    });

    test("should reject invalid track data", async () => {
      req.body = {
        external_track_id: "",
        title: "",
        artist: "",
        duration_ms: 0,
      };

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid track data",
      });

      expect(addTrackMock).not.toHaveBeenCalled();
    });

    test("should reject a missing duration", async () => {
      delete req.body.duration_ms;

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid track data",
      });

      expect(addTrackMock).not.toHaveBeenCalled();
    });

    test("should reject an invalid image URL type", async () => {
      req.body.image_url = 123;

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid track data",
      });

      expect(addTrackMock).not.toHaveBeenCalled();
    });

    test("should add a track with normalized data", async () => {
      req.body = {
        external_track_id: " track-123 ",
        spotify_uri: undefined,
        title: " Song title ",
        artist: " Artist name ",
        image_url: undefined,
        duration_ms: "180000",
      };

      const track = {
        id: 10,
        title: "Song title",
        artist: "Artist name",
      };

      addTrackMock.mockResolvedValue(track);

      await addTrackToPlaylistController(req, res);

      expect(addTrackMock).toHaveBeenCalledWith(
        "1",
        42,
        {
          external_track_id: "track-123",
          spotify_uri: null,
          title: "Song title",
          artist: "Artist name",
          image_url: null,
          duration_ms: 180000,
        }
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(track);
    });

    test("should return 409 if the track already exists", async () => {
      addTrackMock.mockRejectedValue({
        code: "23505",
      });

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ce morceau a déjà été proposé",
      });
    });

    test("should return the service error status if available", async () => {
      addTrackMock.mockRejectedValue({
        statusCode: 403,
        message: "Playlist is closed",
      });

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist is closed",
      });
    });

    test("should return 500 if an unexpected error occurs", async () => {
      const error = new Error("Database error");

      addTrackMock.mockRejectedValue(error);

      await addTrackToPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to add track",
      });

      expect(console.error).toHaveBeenCalledWith(
        "Error adding track:",
        error
      );
    });
  });
});
