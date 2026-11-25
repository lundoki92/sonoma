
import { jest } from "@jest/globals";

// Mocks des contrôleurs
const getInvitePlaylistMock = jest.fn();
const getInviteTracksMock = jest.fn();
const addInviteTrackMock = jest.fn();
const joinPlaylistMock = jest.fn();

// Mock du middleware
const guestAuthMock = jest.fn();

jest.unstable_mockModule("../controllers/inviteController.js", () => ({
  getInvitePlaylistController: getInvitePlaylistMock,
  getInviteTracksController: getInviteTracksMock,
  addInviteTrackController: addInviteTrackMock,
  joinPlaylistController: joinPlaylistMock,
}));

jest.unstable_mockModule("../middlewares/guestAuth.js", () => ({
  guestAuth: guestAuthMock,
}));

const { default: inviteRoute } = await import("../routes/inviteRoute.js");

describe("inviteRoute", () => {
  // Récupération des routes déclarées dans Express
  const routes = inviteRoute.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: layer.route.methods,
      handlers: layer.route.stack.map((handler) => handler.handle),
    }));

  test("GET /:code utilise le contrôleur getInvitePlaylistController", () => {
    const route = routes.find((r) => r.path === "/:code");

    expect(route).toBeDefined();
    expect(route.methods.get).toBe(true);
    expect(route.handlers).toEqual([getInvitePlaylistMock]);
  });

  test("POST /:code/join utilise le contrôleur joinPlaylistController", () => {
    const route = routes.find((r) => r.path === "/:code/join");

    expect(route).toBeDefined();
    expect(route.methods.post).toBe(true);
    expect(route.handlers).toEqual([joinPlaylistMock]);
  });

  test("GET /:code/tracks utilise guestAuth avant getInviteTracksController", () => {
    const route = routes.find((r) => r.path === "/:code/tracks");

    expect(route).toBeDefined();
    expect(route.methods.get).toBe(true);
    expect(route.handlers).toEqual([
      guestAuthMock,
      getInviteTracksMock,
    ]);
  });

test("POST /:code/tracks utilise guestAuth avant addInviteTrackController", () => {
  const route = routes.find(
    (r) => r.path === "/:code/tracks" && r.methods.post
  );

  expect(route).toBeDefined();
  expect(route.methods.post).toBe(true);
  expect(route.handlers).toEqual([
    guestAuthMock,
    addInviteTrackMock,
  ]);
});

  test("guestAuth protège uniquement les routes réservées aux invités", () => {
    const protectedRoutes = routes.filter(
      (route) =>
        route.path === "/:code/tracks"
    );

    const publicRoutes = routes.filter(
      (route) => route.path !== "/:code/tracks"
    );

    protectedRoutes.forEach((route) => {
      expect(route.handlers).toContain(guestAuthMock);
    });

    publicRoutes.forEach((route) => {
      expect(route.handlers).not.toContain(guestAuthMock);
    });
  });
});
