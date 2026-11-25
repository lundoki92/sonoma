
import { jest } from "@jest/globals";
import { ErrorHttp } from "../errors.js";
import { errorsManagement } from "../middlewares/errors.js";

describe("errorsManagement middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};
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

  test("should handle an ErrorHttp error", () => {
    const error = new ErrorHttp(
      422,
      "Données invalides",
      ["Le nom est obligatoire"]
    );

    errorsManagement(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      message: "Données invalides",
      erreurs: ["Le nom est obligatoire"],
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should handle invalid JSON errors", () => {
    const error = {
      type: "entity.parse.failed",
    };

    errorsManagement(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Le corps de la requête doit être du JSON valide",
    });

    expect(console.error).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test("should handle unknown errors", () => {
    const error = new Error("Unexpected error");

    errorsManagement(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Erreur interne du serveur",
    });

    expect(console.error).toHaveBeenCalledWith(error);
    expect(next).not.toHaveBeenCalled();
  });
});
