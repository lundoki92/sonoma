
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
} from "vitest";

import { Login } from "../pages/Login";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  login: vi.fn(),
  useLocation: vi.fn(),
}));

vi.mock("react-router", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => mocks.navigate,
  useLocation: mocks.useLocation,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: mocks.login,
  }),
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

describe("Login", () => {
  beforeEach(() => {
    mocks.login.mockReset();
    mocks.navigate.mockReset();

    mocks.useLocation.mockReturnValue({
      state: null,
    });
  });

  function fillForm({
    email = "alice@example.com",
    password = "password123",
  } = {}) {
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: email },
    });

    fireEvent.change(screen.getByLabelText("Mot de passe"), {
      target: { value: password },
    });
  }

  test("should display the login form", () => {
    render(<Login />);

    expect(screen.getByText("Se connecter")).toBeInTheDocument();
    expect(
      screen.getByText("Retrouve tes soirées et la playlist en cours.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Se connecter" })
    ).toBeDisabled();

    expect(
      screen.getByRole("link", { name: "Créer un compte" })
    ).toHaveAttribute("href", "/register");
  });

  test("should prefill the email when arriving from registration", () => {
    mocks.useLocation.mockReturnValue({
      state: {
        registered: true,
        email: "alice@example.com",
      },
    });

    render(<Login />);

    expect(screen.getByLabelText("Email")).toHaveValue("alice@example.com");
  });

  test("should display the registration success message", () => {
    mocks.useLocation.mockReturnValue({
      state: {
        registered: true,
        email: "alice@example.com",
      },
    });

    render(<Login />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Compte créé : tu peux te connecter."
    );
  });

  test("should not display the registration message without registration state", () => {
    render(<Login />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  test("should enable the submit button when all fields are filled", () => {
    render(<Login />);
    fillForm();

    expect(
      screen.getByRole("button", { name: "Se connecter" })
    ).toBeEnabled();
  });

  test("should call login with the form data", async () => {
    mocks.login.mockResolvedValueOnce();

    render(<Login />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith({
        email: "alice@example.com",
        password: "password123",
      });
    });
  });

  test("should navigate to home after successful login by default", async () => {
    mocks.login.mockResolvedValueOnce();

    render(<Login />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith("/", {
        replace: true,
      });
    });
  });

  test("should navigate to the original destination after successful login", async () => {
    mocks.useLocation.mockReturnValue({
      state: {
        depuis: "/playlist/123",
      },
    });

    mocks.login.mockResolvedValueOnce();

    render(<Login />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith("/playlist/123", {
        replace: true,
      });
    });
  });

  test("should display field errors when login returns a 422 error", async () => {
    mocks.login.mockRejectedValueOnce({
      status: 422,
      errors: {
        email: "Email invalide.",
        password: "Mot de passe incorrect.",
      },
      message: "Erreur de validation",
    });

    render(<Login />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByText("Email invalide.")).toBeInTheDocument();
    expect(
      screen.getByText("Mot de passe incorrect.")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Email ou mot de passe non valide.")
    ).toBeInTheDocument();

    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test("should display a global error when login fails", async () => {
    mocks.login.mockRejectedValueOnce({
      status: 500,
      errors: {},
      message: "Erreur serveur",
    });

    render(<Login />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByText("Erreur serveur")).toBeInTheDocument();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  test("should show the loading state while login is pending", async () => {
    let resolveRequest;

    mocks.login.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<Login />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByRole("button", { name: "Connexion…" })
    ).toBeDisabled();

    resolveRequest();

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalled();
    });
  });

  test("should prevent multiple submissions while login is pending", async () => {
    let resolveRequest;

    mocks.login.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<Login />);
    fillForm();

    const button = screen.getByRole("button", { name: "Se connecter" });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(mocks.login).toHaveBeenCalledTimes(1);

    resolveRequest();

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledTimes(1);
    });
  });
});
