import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";

import { AuthProvider, useAuth } from "../context/AuthContext.jsx";
import * as api from "../api/Frontauth.js";

// Mock des fonctions API
vi.mock("../api/Frontauth.js", () => ({
  myProfile: vi.fn(),
  loggedin: vi.fn(),
  loggedout: vi.fn(),
}));

// Composant de test qui utilise le contexte
function AuthConsumer() {
  const { user, loading, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="loading">{String(loading)}</p>

      <p data-testid="username">{user?.username || "Aucun utilisateur"}</p>

      <button onClick={() => login("user-123").catch(() => {})}>
        Se connecter
      </button>

      <button onClick={() => logout().catch(() => {})}>Se déconnecter</button>
    </div>
  );
}

// Fonction pour afficher le provider et son consommateur
function renderAuthContext() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    api.myProfile.mockResolvedValue({
      user: null,
    });

    api.loggedin.mockResolvedValue({
      user: {
        id: 1,
        username: "Alice",
      },
    });

    api.loggedout.mockResolvedValue({});
  });

  test("should display the loading state initially", () => {
    api.myProfile.mockReturnValue(new Promise(() => {}));

    renderAuthContext();

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  test("should retrieve the user profile on startup", async () => {
    api.myProfile.mockResolvedValueOnce({
      user: {
        id: 1,
        username: "Alice",
      },
    });

    renderAuthContext();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(api.myProfile).toHaveBeenCalledTimes(1);
  });

  test("should remain disconnected if profile retrieval fails", async () => {
    api.myProfile.mockRejectedValueOnce(new Error("Session invalide"));

    renderAuthContext();

    expect(await screen.findByText("Aucun utilisateur")).toBeInTheDocument();

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  test("should log in and update the user", async () => {
    renderAuthContext();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(api.loggedin).toHaveBeenCalledWith("user-123");
    });

    expect(await screen.findByText("Alice")).toBeInTheDocument();
  });

  test("should not update the user if login fails", async () => {
    api.loggedin.mockRejectedValueOnce(new Error("Connexion impossible"));

    renderAuthContext();

    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(api.loggedin).toHaveBeenCalledWith("user-123");
    });

    expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument();
  });

  test("should log out and clear the user", async () => {
    api.myProfile.mockResolvedValueOnce({
      user: {
        id: 1,
        username: "Alice",
      },
    });

    renderAuthContext();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));

    await waitFor(() => {
      expect(api.loggedout).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Aucun utilisateur")).toBeInTheDocument();
    });
  });

  test("should keep the user if logout fails", async () => {
    api.myProfile.mockResolvedValueOnce({
      user: {
        id: 1,
        username: "Alice",
      },
    });

    api.loggedout.mockRejectedValueOnce(new Error("Déconnexion impossible"));

    renderAuthContext();

    expect(await screen.findByText("Alice")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }));

    await waitFor(() => {
      expect(api.loggedout).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("Alice")).toBeInTheDocument();
  });
});
