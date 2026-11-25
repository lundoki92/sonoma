
import { jest } from "@jest/globals";
import { Router } from "express";

// Mock du contrôleur
const registerMock = jest.fn();
const loginMock = jest.fn();
const logoutMock = jest.fn();
const myprofileMock = jest.fn();

// Mock du middleware auth
const authMock = jest.fn();

jest.unstable_mockModule("../controllers/authController.js", () => ({
  register: registerMock,
  login: loginMock,
  logout: logoutMock,
  myprofile: myprofileMock,
}));

jest.unstable_mockModule("../middlewares/auth.js", () => ({
  auth: authMock,
}));

const { authRouter } = await import("../routes/authRoute.js");

describe("authRoute", () => {
  // Récupère les routes enregistrées dans le Router Express
  const routes = authRouter.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: layer.route.methods,
      handlers: layer.route.stack.map((handler) => handler.handle),
    }));

  test("POST /register utilise le contrôleur register", () => {
    const route = routes.find((r) => r.path === "/register");

    expect(route).toBeDefined();
    expect(route.methods.post).toBe(true);
    expect(route.handlers).toContain(registerMock);
  });

  test("POST /login utilise le contrôleur login", () => {
    const route = routes.find((r) => r.path === "/login");

    expect(route).toBeDefined();
    expect(route.methods.post).toBe(true);
    expect(route.handlers).toContain(loginMock);
  });

  test("POST /logout utilise le contrôleur logout", () => {
    const route = routes.find((r) => r.path === "/logout");

    expect(route).toBeDefined();
    expect(route.methods.post).toBe(true);
    expect(route.handlers).toContain(logoutMock);
  });

  test("GET /myprofile utilise le middleware auth avant le contrôleur", () => {
    const route = routes.find((r) => r.path === "/myprofile");

    expect(route).toBeDefined();
    expect(route.methods.get).toBe(true);
    expect(route.handlers).toEqual([authMock, myprofileMock]);
  });

  test("le middleware auth n'est pas utilisé sur les autres routes", () => {
    const protectedRoute = routes.find(
      (r) => r.path === "/myprofile"
    );

    const publicRoutes = routes.filter(
      (r) => r.path !== "/myprofile"
    );

    expect(protectedRoute.handlers).toContain(authMock);

    publicRoutes.forEach((route) => {
      expect(route.handlers).not.toContain(authMock);
    });
  });
});
