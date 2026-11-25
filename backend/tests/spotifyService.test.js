
import { jest } from "@jest/globals";

let fetchMock;
let getSpotifyAppToken;
let searchSpotifyTracks;

// reinitialize module to isolate cache between each test
beforeEach(async () => {
  jest.resetModules();

  fetchMock = jest.fn();
  globalThis.fetch = fetchMock;

  process.env.SPOTIFY_CLIENT_ID = "test-client-id";
  process.env.SPOTIFY_CLIENT_SECRET = "test-client-secret";

  const service = await import("../services/spotifyService.js");

  getSpotifyAppToken = service.getSpotifyAppToken;
  searchSpotifyTracks = service.searchSpotifyTracks;
});

// fictive response when getting token
function mockTokenResponse() {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      access_token: "fake-spotify-token",
      token_type: "Bearer",
      expires_in: 3600,
    }),
  });
}

// GET SPOTIFY APP TOKEN
describe("getSpotifyAppToken", () => {
  test("should retrieve a Spotify access token", async () => {
    mockTokenResponse();

    const result = await getSpotifyAppToken();

    expect(result).toBe("fake-spotify-token");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://accounts.spotify.com/api/token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: `Basic ${Buffer.from(
            "test-client-id:test-client-secret"
          ).toString("base64")}`,
        }),
      })
    );
  });

  test("should reuse the cached token without calling Spotify again", async () => {
    mockTokenResponse();

    const firstToken = await getSpotifyAppToken();
    const secondToken = await getSpotifyAppToken();

    expect(firstToken).toBe("fake-spotify-token");
    expect(secondToken).toBe("fake-spotify-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test("should throw an error when Spotify credentials are missing", async () => {
    delete process.env.SPOTIFY_CLIENT_ID;

    await expect(
      getSpotifyAppToken()
    ).rejects.toThrow(
      "Client ID ou Client Secret Spotify manquant"
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("should throw an error when Spotify authentication fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    await expect(
      getSpotifyAppToken()
    ).rejects.toThrow(
      "Erreur lors de l'authentification Spotify : 401"
    );
  });
});

// SEARCH SPOTIFY TRACKS
describe("searchSpotifyTracks", () => {
  test("should search tracks and return the expected data", async () => {
    mockTokenResponse();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [
            {
              id: "spotify123",
              uri: "spotify:track:123",
              name: "Test song",
              artists: [{ name: "Test artist" }],
              album: {
                images: [{ url: "https://example.com/image.jpg" }],
              },
              duration_ms: 180000,
            },
          ],
        },
      }),
    });

    const result = await searchSpotifyTracks("Test song");

    expect(result).toEqual([
      {
        spotifyId: "spotify123",
        uri: "spotify:track:123",
        title: "Test song",
        artist: "Test artist",
        cover: "https://example.com/image.jpg",
        durationMs: 180000,
      },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Vérifier la requête de recherche
    expect(fetchMock.mock.calls[1][0]).toContain(
      "q=Test+song"
    );
  });

  test("should combine multiple artist names", async () => {
    mockTokenResponse();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [
            {
              id: "spotify456",
              uri: "spotify:track:456",
              name: "Collaboration",
              artists: [
                { name: "Artist One" },
                { name: "Artist Two" },
              ],
              album: {
                images: [],
              },
              duration_ms: 200000,
            },
          ],
        },
      }),
    });

    const result = await searchSpotifyTracks("Collaboration");

    expect(result[0].artist).toBe("Artist One, Artist Two");
  });

  test("should return null when a track has no cover image", async () => {
    mockTokenResponse();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [
            {
              id: "spotify789",
              uri: "spotify:track:789",
              name: "No cover",
              artists: [{ name: "Artist" }],
              album: {
                images: [],
              },
              duration_ms: 180000,
            },
          ],
        },
      }),
    });

    const result = await searchSpotifyTracks("No cover");

    expect(result[0].cover).toBeNull();
  });

  test("should return an empty array when no tracks are found", async () => {
    mockTokenResponse();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [],
        },
      }),
    });

    const result = await searchSpotifyTracks("Unknown song");

    expect(result).toEqual([]);
  });

  test("should throw an error when Spotify search fails", async () => {
    mockTokenResponse();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      searchSpotifyTracks("Test song")
    ).rejects.toThrow(
      "Erreur lors de la recherche Spotify : 500"
    );
  });
});
