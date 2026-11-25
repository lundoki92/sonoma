
import { jest } from "@jest/globals";
import { ErrorHttp } from "../errors.js";

const registerMock = jest.fn();
const loginMock = jest.fn();
const profileMock = jest.fn();

jest.unstable_mockModule("../services/authService.js", () => ({
  register: registerMock,
  login: loginMock,
  profile: profileMock,
}));

const {
  register,
  login,
  logout,
  myprofile,
} = await import("../controllers/authController.js");

describe("authController", () => {
  let req;
  let res;

  beforeEach(() => {
    registerMock.mockReset();
    loginMock.mockReset();
    profileMock.mockReset();

    process.env.NODE_ENV = "test";

    req = {
      body: {},
      user: { id: 42 },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      end: jest.fn(),
    };
  });

  // ---------- REGISTER ----------

  describe("register", () => {
    test("should return an error if the registration data is invalid", async () => {
      req.body = {
        username: "",
        email: "invalid-email",
        password: "123",
      };

      await expect(register(req, res)).rejects.toMatchObject({
        status: 422,
        message: "Données invalides",
      });

      expect(registerMock).not.toHaveBeenCalled();
    });

    test("should return an error if the username exceeds 15 characters", async () => {
      req.body = {
        username: "ThisUsernameIsTooLong",
        email: "test@example.com",
        password: "password123",
      };

      await expect(register(req, res)).rejects.toMatchObject({
        status: 422,
        message: "Données invalides",
      });

      expect(registerMock).not.toHaveBeenCalled();
    });

    test("should register a user with normalized data", async () => {
      const user = {
        id: 42,
        username: "Alex",
        email: "alex@example.com",
      };

      req.body = {
        username: " Alex ",
        email: "  ALEX@EXAMPLE.COM ",
        password: "password123",
      };

      registerMock.mockResolvedValue(user);

      await register(req, res);

      expect(registerMock).toHaveBeenCalledWith({
        username: "Alex",
        email: "alex@example.com",
        password: "password123",
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ user });
    });
  });

  // ---------- LOGIN ----------

  describe("login", () => {
    test("should return an error if the email or password is missing", async () => {
      req.body = {
        email: "",
        password: "",
      };

      await expect(login(req, res)).rejects.toMatchObject({
        status: 422,
        message: "Données invalides",
      });

      expect(loginMock).not.toHaveBeenCalled();
    });

    test("should log in a user and create an authentication cookie", async () => {
      const user = {
        id: 42,
        username: "Alex",
        email: "alex@example.com",
      };

      const token = "jwt-token";

      req.body = {
        email: "  ALEX@EXAMPLE.COM ",
        password: "password123",
      };

      loginMock.mockResolvedValue({ user, token });

      await login(req, res);

      expect(loginMock).toHaveBeenCalledWith({
        email: "alex@example.com",
        password: "password123",
      });

      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        token,
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          maxAge: 2 * 60 * 60 * 1000,
        }
      );

      expect(res.json).toHaveBeenCalledWith({ user });
    });
  });

  // ---------- LOGOUT ----------

  describe("logout", () => {
    test("should clear the authentication cookie", async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith(
        "token",
        {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        }
      );

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalledTimes(1);
    });
  });

  // ---------- MY PROFILE ----------

  describe("myprofile", () => {
    test("should return the connected user's profile", async () => {
      const user = {
        id: 42,
        username: "Alex",
        email: "alex@example.com",
      };

      profileMock.mockResolvedValue(user);

      await myprofile(req, res);

      expect(profileMock).toHaveBeenCalledWith(42);
      expect(res.json).toHaveBeenCalledWith({ user });
    });
  });
});
