
import { jest } from "@jest/globals";

const findGuestMock = jest.fn();

jest.unstable_mockModule("../models/inviteModel.js", () => ({
  findGuestByTokenAndCodeModel: findGuestMock,
}));

const { guestAuth } = await import("../middlewares/guestAuth.js");

describe("guestAuth middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    findGuestMock.mockReset();

    req = {
      params: {
        code: "ABC123",
      },
      cookies: {
        guest_ABC123: "valid-token",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should return an error if no token is provided", async () => {
    req.cookies = {};

    await guestAuth(req, res, next);

    expect(findGuestMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Server error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return an error if no guest is found", async () => {
    findGuestMock.mockResolvedValue(null);

    await guestAuth(req, res, next);

    expect(findGuestMock).toHaveBeenCalledWith(
      "valid-token",
      "ABC123"
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Server error",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("should authenticate the guest if a guest is found", async () => {
    const guest = {
      id: 42,
      name: "Alex",
      playlistId: 10,
    };

    findGuestMock.mockResolvedValue(guest);

    await guestAuth(req, res, next);

    expect(findGuestMock).toHaveBeenCalledWith(
      "valid-token",
      "ABC123"
    );

    expect(req.guest).toEqual(guest);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("should return a server error if the model throws an error", async () => {
    findGuestMock.mockRejectedValue(
      new Error("Database error")
    );

    await guestAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Server error",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
