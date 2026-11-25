
import { jest } from "@jest/globals";

const searchSpotifyTracksMock = jest.fn();

jest.unstable_mockModule("../controllers/musicController.js", () => ({
  searchSpotifyTracksController: searchSpotifyTracksMock,
}));

const { default: musicRoute } = await import("../routes/musicRoute.js");

describe("musicRoute", () => {
  const routes = musicRoute.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: layer.route.methods,
      handlers: layer.route.stack.map((handler) => handler.handle),
    }));

  test("GET /search utilise searchSpotifyTracksController", () => {
    const route = routes.find((r) => r.path === "/search");

    expect(route).toBeDefined();
    expect(route.methods.get).toBe(true);
    expect(route.handlers).toEqual([searchSpotifyTracksMock]);
  });

  test("la route /search est accessible sans middleware d'authentification", () => {
    const route = routes.find((r) => r.path === "/search");

    expect(route).toBeDefined();
    expect(route.handlers).toHaveLength(1);
    expect(route.handlers).not.toContain(searchSpotifyTracksMock.mock);
  });

  test("la route utilise uniquement le contrôleur de recherche Spotify", () => {
    expect(routes).toHaveLength(1);

    expect(routes[0].handlers).toEqual([
      searchSpotifyTracksMock,
    ]);
  });
});
