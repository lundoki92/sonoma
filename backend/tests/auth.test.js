import { jest } from "@jest/globals";

const verifyMock = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: verifyMock,
  },
}));

const { auth } = await import("../middlewares/auth.js");

describe("auth middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    verifyMock.mockReset();
    process.env.JWT_SECRET = "test-secret";

    req = {
      cookies: {},
    };

    res = {};
    next = jest.fn();
  });

  test("should return an error if no token is provided", () => {
    expect(() => auth(req, res, next)).toThrow("Connexion requise");

    expect(verifyMock).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should authenticate the user if the token is valid", () => {
    req.cookies.token = "valid-token";

    verifyMock.mockReturnValue({
      sub: 42,
      role: "host",
    });

    auth(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith(
      "valid-token",
      "test-secret"
    );

    expect(req.user).toEqual({
      id: 42,
      role: "host",
    });

    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should return an error if the token is invalid", () => {
    req.cookies.token = "invalid-token";

    verifyMock.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    expect(() => auth(req, res, next)).toThrow(
      "Session expirée ou invalide"
    );

    expect(next).not.toHaveBeenCalled();
  });

  test("should return an error if the token has expired", () => {
    req.cookies.token = "expired-token";

    verifyMock.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    expect(() => auth(req, res, next)).toThrow(
      "Session expirée ou invalide"
    );

    expect(next).not.toHaveBeenCalled();
  });
});