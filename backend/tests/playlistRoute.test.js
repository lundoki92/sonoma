
import { jest } from "@jest/globals";

// Mocks des contrôleurs
const createPlaylistMock = jest.fn();
const getPlaylistByIdMock = jest.fn();
const getMyPlaylistsMock = jest.fn();

// Mock du middleware auth
const authMock = jest.fn();

jest.unstable_mockModule("../controllers/playlistController.js", () => ({
  createPlaylistController: createPlaylistMock,
  getPlaylistByIdController: getPlaylistByIdMock,
  getMyPlaylistsController: getMyPlaylistsMock,
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  auth: authMock,
}));

const { default: routePlaylist } = await import("../routes/playlistRoute.js");

describe("playlistRoute", () => {
  const routes = routePlaylist.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: layer.route.methods,
      handlers: layer.route.stack.map((handler) => handler.handle),
    }));

  test("POST / utilise auth avant createPlaylistController", () => {
    const route = routes.find(
      (r) => r.path === "/" && r.methods.post
    );

    expect(route).toBeDefined();
    expect(route.handlers).toEqual([
      authMock,
      createPlaylistMock,
    ]);
  });

  test("GET / utilise auth avant getMyPlaylistsController", () => {
    const route = routes.find(
      (r) => r.path === "/" && r.methods.get
    );

    expect(route).toBeDefined();
    expect(route.handlers).toEqual([
      authMock,
      getMyPlaylistsMock,
    ]);
  });

  test("GET /:id utilise auth avant getPlaylistByIdController", () => {
    const route = routes.find(
      (r) => r.path === "/:id" && r.methods.get
    );

    expect(route).toBeDefined();
    expect(route.handlers).toEqual([
      authMock,
      getPlaylistByIdMock,
    ]);
  });

  test("toutes les routes sont protégées par auth", () => {
    expect(routes).toHaveLength(3);

    routes.forEach((route) => {
      expect(route.handlers[0]).toBe(authMock);
    });
  });

  test("chaque route utilise le bon contrôleur", () => {
    expect(routes.every((route) => route.handlers.length === 2)).toBe(true);
  });
});
