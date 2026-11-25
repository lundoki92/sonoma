import { jest } from "@jest/globals";

const searchSpotifyTracksMock = jest.fn();

jest.unstable_mockModule("../services/spotifyService.js", () => ({
  searchSpotifyTracks: searchSpotifyTracksMock,
}));

const {
  searchSpotifyTracksController,
} = await import("../controllers/musicController.js");

describe("spotifyController", () => {
  let req;
  let res;

  beforeEach(() => {
    searchSpotifyTracksMock.mockReset();

    req = {
      query: {
        q: "Daft Punk",
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

  test("should return 400 if the search query is missing", async () => {
    req.query = {};

    await searchSpotifyTracksController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "At least 3 characters are required",
    });

    expect(searchSpotifyTracksMock).not.toHaveBeenCalled();
  });

  test("should return 400 if the search query is too short", async () => {
    req.query.q = "ab";

    await searchSpotifyTracksController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "At least 3 characters are required",
    });

    expect(searchSpotifyTracksMock).not.toHaveBeenCalled();
  });

  test("should return 400 if the search query contains only spaces", async () => {
    req.query.q = "   ";

    await searchSpotifyTracksController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "At least 3 characters are required",
    });

    expect(searchSpotifyTracksMock).not.toHaveBeenCalled();
  });

  test("should search Spotify tracks successfully", async () => {
    const tracks = [
      {
        id: "track-1",
        title: "Get Lucky",
        artist: "Daft Punk",
      },
      {
        id: "track-2",
        title: "One More Time",
        artist: "Daft Punk",
      },
    ];

    searchSpotifyTracksMock.mockResolvedValue(tracks);

    await searchSpotifyTracksController(req, res);

    expect(searchSpotifyTracksMock).toHaveBeenCalledWith("Daft Punk");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(tracks);
  });

  test("should trim the search query before calling the service", async () => {
    req.query.q = "  Daft Punk  ";

    searchSpotifyTracksMock.mockResolvedValue([]);

    await searchSpotifyTracksController(req, res);

    expect(searchSpotifyTracksMock).toHaveBeenCalledWith("Daft Punk");
  });

  test("should return 502 if the Spotify service fails", async () => {
    const error = new Error("Spotify API unavailable");

    searchSpotifyTracksMock.mockRejectedValue(error);

    await searchSpotifyTracksController(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      message: "Failed to search Spotify",
    });

    expect(console.error).toHaveBeenCalledWith(
      "Error searching Spotify tracks:",
      error
    );
  });
});
