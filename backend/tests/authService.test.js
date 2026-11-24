
import { jest } from "@jest/globals";

// Mock bcrypt
const hash = jest.fn();
const compare = jest.fn();

jest.unstable_mockModule("bcryptjs", () => ({
  default: { hash, compare },
}));

// Mock JWT
const sign = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign },
}));

// Mock user model
const foundByEmail = jest.fn();
const foundById = jest.fn();
const create = jest.fn();

jest.unstable_mockModule("../models/user.js", () => ({
  foundByEmail,
  foundById,
  create,
}));

// Import service after mocks
const { register, login, profile } = await import(
  "../services/authService.js"
);

beforeEach(() => {
  jest.clearAllMocks();
});

// REGISTER
describe("register", () => {
  const userData = {
    username: "Alice",
    email: "alice@example.com",
    password: "password123",
  };

  test("should register a user successfully", async () => {
    const createdUser = {
      id: 1,
      username: "Alice",
      email: "alice@example.com",
    };

    foundByEmail.mockResolvedValue(null);
    hash.mockResolvedValue("hashedPassword");
    create.mockResolvedValue(createdUser);

    const result = await register(userData);

    expect(foundByEmail).toHaveBeenCalledWith(userData.email);

    expect(hash).toHaveBeenCalledWith(
      userData.password,
      10
    );

    expect(create).toHaveBeenCalledWith({
      username: userData.username,
      email: userData.email,
      passwordHash: "hashedPassword",
    });

    expect(result).toEqual(createdUser);
  });

  test("should throw a 409 error when the email already exists", async () => {
    foundByEmail.mockResolvedValue({
      id: 1,
      email: userData.email,
    });

    await expect(register(userData)).rejects.toMatchObject({
      message: "Un compte existe déjà avec cet email",
      status: 409,
    });

    expect(hash).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  test("should throw a 409 error when the database returns a duplicate email error", async () => {
    foundByEmail.mockResolvedValue(null);
    hash.mockResolvedValue("hashedPassword");

    const error = new Error("Duplicate email");
    error.code = "23505";

    create.mockRejectedValue(error);

    await expect(register(userData)).rejects.toMatchObject({
      message: "Un compte existe déjà avec cet email",
      status: 409,
    });
  });

  test("should propagate other database errors", async () => {
    foundByEmail.mockResolvedValue(null);
    hash.mockResolvedValue("hashedPassword");

    const error = new Error("Database error");
    create.mockRejectedValue(error);

    await expect(register(userData)).rejects.toThrow(
      "Database error"
    );
  });
});

// LOGIN
describe("login", () => {
  const credentials = {
    email: "alice@example.com",
    password: "password123",
  };

  test("should log in a user successfully", async () => {
    const user = {
      id: 1,
      username: "Alice",
      email: credentials.email,
      password_hash: "hashedPassword",
      role: "host",
    };

    const token = "fake-jwt-token";

    foundByEmail.mockResolvedValue(user);
    compare.mockResolvedValue(true);
    sign.mockReturnValue(token);

    const result = await login(credentials);

    expect(foundByEmail).toHaveBeenCalledWith(credentials.email);

    expect(compare).toHaveBeenCalledWith(
      credentials.password,
      user.password_hash
    );

    expect(sign).toHaveBeenCalledWith(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    expect(result.token).toBe(token);
    expect(result.user.id).toBe(user.id);
    expect(result.user.username).toBe(user.username);
    expect(result.user.email).toBe(user.email);
  });

  test("should not return the password hash", async () => {
    const user = {
      id: 1,
      username: "Alice",
      email: credentials.email,
      password_hash: "hashedPassword",
      role: "host",
    };

    foundByEmail.mockResolvedValue(user);
    compare.mockResolvedValue(true);
    sign.mockReturnValue("fake-jwt-token");

    const result = await login(credentials);

    expect(result.user).not.toHaveProperty("password_hash");
  });

  test("should throw a 401 error when the email does not exist", async () => {
    foundByEmail.mockResolvedValue(null);

    await expect(login(credentials)).rejects.toMatchObject({
      message: "Email ou mot de passe incorrect",
      status: 401,
    });

    expect(compare).not.toHaveBeenCalled();
    expect(sign).not.toHaveBeenCalled();
  });

  test("should throw a 401 error when the password is incorrect", async () => {
    foundByEmail.mockResolvedValue({
      id: 1,
      password_hash: "hashedPassword",
    });

    compare.mockResolvedValue(false);

    await expect(login(credentials)).rejects.toMatchObject({
      message: "Email ou mot de passe incorrect",
      status: 401,
    });

    expect(sign).not.toHaveBeenCalled();
  });
});

// PROFILE
describe("profile", () => {
  test("should return the user profile", async () => {
    const user = {
      id: 1,
      username: "Alice",
      email: "alice@example.com",
    };

    foundById.mockResolvedValue(user);

    const result = await profile(1);

    expect(foundById).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });

  test("should throw a 401 error when the user does not exist", async () => {
    foundById.mockResolvedValue(null);

    await expect(profile(99)).rejects.toMatchObject({
      message: "Session invalide",
      status: 401,
    });
  });
});
