
import { jest } from "@jest/globals";

// Mocks des contrôleurs
const getTracksByPlaylistMock = jest.fn();
const addTrackToPlaylistMock = jest.fn();

// Mock du middleware auth
const authMock = jest.fn();

jest.unstable_mockModule("../controllers/trackController.js", () => ({
  getTracksByPlaylistController: getTracksByPlaylistMock,
  addTrackToPlaylistController: addTrackToPlaylistMock,
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  auth: authMock,
}));

const { default: trackRoute } = await import("../routes/trackRoute.js");

describe("trackRoute", () => {
  const routes = trackRoute.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: layer.route.methods,
      handlers: layer.route.stack.map((handler) => handler.handle),
    }));

  test("GET /:playlistId/tracks utilise auth avant getTracksByPlaylistController", () => {
    const route = routes.find(
      (r) => r.path === "/:playlistId/tracks" && r.methods.get
    );

    expect(route).toBeDefined();
    expect(route.handlers).toEqual([
      authMock,
      getTracksByPlaylistMock,
    ]);
  });

  test("POST /:playlistId/tracks utilise auth avant addTrackToPlaylistController", () => {
    const route = routes.find(
      (r) => r.path === "/:playlistId/tracks" && r.methods.post
    );

    expect(route).toBeDefined();
    expect(route.handlers).toEqual([
      authMock,
      addTrackToPlaylistMock,
    ]);
  });

  test("toutes les routes sont protégées par auth", () => {
    expect(routes).toHaveLength(2);

    routes.forEach((route) => {
      expect(route.handlers[0]).toBe(authMock);
    });
  });

  test("chaque route utilise un seul contrôleur après le middleware", () => {
    routes.forEach((route) => {
      expect(route.handlers).toHaveLength(2);
    });
  });
});
