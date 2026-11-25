
import { jest } from "@jest/globals";

const getInvitePlaylistMock = jest.fn();
const getInviteTracksMock = jest.fn();
const addInviteTrackMock = jest.fn();
const joinPlaylistMock = jest.fn();

jest.unstable_mockModule("../services/inviteService.js", () => ({
  getInvitePlaylistService: getInvitePlaylistMock,
  getInviteTracksService: getInviteTracksMock,
  addInviteTrackService: addInviteTrackMock,
  joinPlaylistService: joinPlaylistMock,
}));

const {
  getInvitePlaylistController,
  getInviteTracksController,
  addInviteTrackController,
  joinPlaylistController,
} = await import("../controllers/inviteController.js");

const VALID_CODE = "123e4567-e89b-12d3-a456-426614174000";

describe("inviteController", () => {
  let req;
  let res;

  beforeEach(() => {
    getInvitePlaylistMock.mockReset();
    getInviteTracksMock.mockReset();
    addInviteTrackMock.mockReset();
    joinPlaylistMock.mockReset();

    req = {
      params: { code: VALID_CODE },
      body: {},
      guest: { id: 42 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------- GET INVITE PLAYLIST ----------

  describe("getInvitePlaylistController", () => {
    test("should return 404 if the playlist code is invalid", async () => {
      req.params.code = "invalid-code";

      await getInvitePlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist not found",
      });

      expect(getInvitePlaylistMock).not.toHaveBeenCalled();
    });

    test("should return the invited playlist", async () => {
      const playlist = {
        id: 1,
        name: "Birthday Party",
      };

      getInvitePlaylistMock.mockResolvedValue(playlist);

      await getInvitePlaylistController(req, res);

      expect(getInvitePlaylistMock).toHaveBeenCalledWith(VALID_CODE);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(playlist);
    });

    test("should return a server error if the service fails", async () => {
      getInvitePlaylistMock.mockRejectedValue(
        new Error("Database error")
      );

      await getInvitePlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch playlist",
      });

      expect(console.error).toHaveBeenCalled();
    });
  });

  // ---------- GET INVITE TRACKS ----------

  describe("getInviteTracksController", () => {
    test("should return 404 if the playlist code is invalid", async () => {
      req.params.code = "invalid-code";

      await getInviteTracksController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist not found",
      });

      expect(getInviteTracksMock).not.toHaveBeenCalled();
    });

    test("should return the playlist tracks for the guest", async () => {
      const tracks = [
        { id: 1, title: "Song One" },
        { id: 2, title: "Song Two" },
      ];

      getInviteTracksMock.mockResolvedValue(tracks);

      await getInviteTracksController(req, res);

      expect(getInviteTracksMock).toHaveBeenCalledWith(
        VALID_CODE,
        42
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(tracks);
    });

    test("should return a server error if the service fails", async () => {
      getInviteTracksMock.mockRejectedValue(
        new Error("Database error")
      );

      await getInviteTracksController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to fetch tracks",
      });
    });
  });

  // ---------- ADD INVITE TRACK ----------

  describe("addInviteTrackController", () => {
    test("should return 404 if the playlist code is invalid", async () => {
      req.params.code = "invalid-code";

      await addInviteTrackController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist not found",
      });

      expect(addInviteTrackMock).not.toHaveBeenCalled();
    });

    test("should reject invalid track data", async () => {
      req.body = {
        external_track_id: "",
        title: "",
        artist: "",
        duration_ms: 0,
      };

      await addInviteTrackController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid track data",
      });

      expect(addInviteTrackMock).not.toHaveBeenCalled();
    });

    test("should add a track with normalized data", async () => {
      req.body = {
        external_track_id: " spotify-track-123 ",
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

      addInviteTrackMock.mockResolvedValue(track);

      await addInviteTrackController(req, res);

      expect(addInviteTrackMock).toHaveBeenCalledWith(
        VALID_CODE,
        42,
        {
          external_track_id: "spotify-track-123",
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

    test("should return 409 if the track has already been proposed", async () => {
      addInviteTrackMock.mockRejectedValue({
        code: "23505",
      });

      req.body = {
        external_track_id: "track-123",
        title: "Song title",
        artist: "Artist name",
        duration_ms: 180000,
      };

      await addInviteTrackController(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ce morceau a déjà été proposé",
      });
    });

    test("should return the service error status if available", async () => {
      req.body = {
        external_track_id: "track-123",
        title: "Song title",
        artist: "Artist name",
        duration_ms: 180000,
      };

      addInviteTrackMock.mockRejectedValue({
        statusCode: 403,
        message: "Playlist is closed",
      });

      await addInviteTrackController(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist is closed",
      });
    });
  });

  // ---------- JOIN PLAYLIST ----------

  describe("joinPlaylistController", () => {
    test("should return 404 if the playlist code is invalid", async () => {
      req.params.code = "invalid-code";

      await joinPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Playlist not found",
      });

      expect(joinPlaylistMock).not.toHaveBeenCalled();
    });

    test("should reject an invalid guest name", async () => {
      req.body = {
        guest_name: "   ",
      };

      await joinPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid name",
      });

      expect(joinPlaylistMock).not.toHaveBeenCalled();
    });

    test("should reject a guest name longer than 50 characters", async () => {
      req.body = {
        guest_name: "A".repeat(51),
      };

      await joinPlaylistController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid name",
      });

      expect(joinPlaylistMock).not.toHaveBeenCalled();
    });

    test("should join the playlist and create a guest cookie", async () => {
      const guest = {
        id: 42,
        guest_name: "Alex",
      };

      const guestToken = "guest-token-123";

      req.body = {
        guest_name: "Alex",
      };

      joinPlaylistMock.mockResolvedValue({
        guest,
        guestToken,
      });

      await joinPlaylistController(req, res);

      expect(joinPlaylistMock).toHaveBeenCalledWith(
        VALID_CODE,
        "Alex"
      );

      expect(res.cookie).toHaveBeenCalledWith(
        `guest_${VALID_CODE}`,
        guestToken,
        {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 1000 * 60 * 60 * 24 * 30,
        }
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(guest);
    });
  });
});
