import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { Register } from "../pages/Register";
import { registered } from "../api/Frontauth";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("react-router", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => mocks.navigate,
}));

vi.mock("../api/Frontauth.js", () => ({
  registered: vi.fn(),
}));

vi.mock("../components/common/ExplanationText.jsx", () => ({
  default: ({ title, text }) => (
    <div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  ),
}));

vi.mock("../components/Champ.jsx", () => ({
  Champ: ({
    id,
    label,
    value,
    onChange,
    erreur,
    type = "text",
    placeholder,
    autoComplete,
    required,
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
      {erreur && <p role="alert">{erreur}</p>}
    </div>
  ),
}));

describe("Register", () => {
  beforeEach(() => {
    registered.mockReset();
    mocks.navigate.mockReset();
  });

  function fillForm({
    username = "Alice",
    email = "alice@example.com",
    password = "password123",
  } = {}) {
    fireEvent.change(screen.getByLabelText("Pseudo"), {
      target: { value: username },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });

    fireEvent.change(
      screen.getByLabelText("Mot de passe (8 caractères minimum)"),
      {
        target: { value: password },
      },
    );
  }

  test("should display the registration form", () => {
    render(<Register />);

    expect(screen.getByText("Créer un compte")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Un pseudo, un email, un mot de passe : tu peux lancer ta première soirée.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Pseudo")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Mot de passe (8 caractères minimum)"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Créer mon compte" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Se connecter" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  test("should disable the submit button when the form is empty", () => {
    render(<Register />);

    expect(
      screen.getByRole("button", { name: "Créer mon compte" }),
    ).toBeDisabled();
  });

  test("should enable the submit button when all fields are filled", () => {
    render(<Register />);
    fillForm();

    expect(
      screen.getByRole("button", { name: "Créer mon compte" }),
    ).toBeEnabled();
  });

  test("should not enable the submit button when a field contains only spaces", () => {
    render(<Register />);

    fillForm({
      username: "   ",
      email: "alice@example.com",
      password: "password123",
    });

    expect(
      screen.getByRole("button", { name: "Créer mon compte" }),
    ).toBeDisabled();
  });

  test("should call registered with the form data", async () => {
    registered.mockResolvedValueOnce({ success: true });

    render(<Register />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    await waitFor(() => {
      expect(registered).toHaveBeenCalledWith({
        username: "Alice",
        email: "alice@example.com",
        password: "password123",
      });
    });
  });

  test("should navigate to login after successful registration", async () => {
    registered.mockResolvedValueOnce({ success: true });

    render(<Register />);
    fillForm({ email: "  alice@example.com  " });

    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith("/login", {
        state: {
          registered: true,
          email: "alice@example.com",
        },
      });
    });
  });

  test("should display field errors when registration returns a 422 error", async () => {
    registered.mockRejectedValueOnce({
      status: 422,
      errors: {
        username: "Ce pseudo est déjà utilisé.",
        email: "Cet email est déjà utilisé.",
      },
      message: "Erreur de validation",
    });

    render(<Register />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(
      await screen.findByText("Ce pseudo est déjà utilisé."),
    ).toBeInTheDocument();

    expect(screen.getByText("Cet email est déjà utilisé.")).toBeInTheDocument();

    expect(
      screen.getByText("Corrige les champs signalés."),
    ).toBeInTheDocument();
  });

  test("should display a global error when registration fails", async () => {
    registered.mockRejectedValueOnce({
      status: 500,
      errors: {},
      message: "Erreur serveur",
    });

    render(<Register />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(await screen.findByText("Erreur serveur")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test("should show the loading state while registration is pending", async () => {
    let resolveRequest;

    registered.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<Register />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(
      await screen.findByRole("button", { name: "Création…" }),
    ).toBeDisabled();

    resolveRequest({ success: true });

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalled();
    });
  });

  test("should prevent multiple submissions while registration is pending", async () => {
    let resolveRequest;

    registered.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );

    render(<Register />);
    fillForm();

    const submitButton = screen.getByRole("button", {
      name: "Créer mon compte",
    });

    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    expect(registered).toHaveBeenCalledTimes(1);

    resolveRequest({ success: true });

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledTimes(1);
    });
  });
});
