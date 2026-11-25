
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";

import { ProtectedRoutes } from "../components/ProtectedRoutes";
import { useAuth } from "../context/AuthContext.jsx";

// Mock du contexte d'authentification
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

// Permet de vérifier les informations de navigation
function LocationDisplay() {
  const location = useLocation();

  return (
    <div>
      <p data-testid="pathname">{location.pathname}</p>
      <p data-testid="depuis">
        {location.state?.depuis || "Aucun chemin enregistré"}
      </p>
    </div>
  );
}

// Fonction pour afficher la route protégée
function renderProtectedRoute(authState, initialPath = "/dashboard") {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/login"
          element={
            <div>
              <h1>Page de connexion</h1>
              <LocationDisplay />
            </div>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoutes>
              <h1>Dashboard privé</h1>
            </ProtectedRoutes>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should display a loading message while authentication is loading", () => {
    renderProtectedRoute({
      user: null,
      loading: true,
    });

    expect(screen.getByRole("status")).toHaveTextContent("Chargement…");
    expect(screen.queryByText("Dashboard privé")).not.toBeInTheDocument();
  });

  test("should display the protected page when the user is authenticated", () => {
    renderProtectedRoute({
      user: {
        id: 1,
        username: "Alice",
      },
      loading: false,
    });

    expect(screen.getByText("Dashboard privé")).toBeInTheDocument();
    expect(screen.queryByText("Page de connexion")).not.toBeInTheDocument();
  });

  test("should redirect to login when the user is not authenticated", () => {
    renderProtectedRoute({
      user: null,
      loading: false,
    });

    expect(screen.getByText("Page de connexion")).toBeInTheDocument();
    expect(screen.getByTestId("pathname")).toHaveTextContent("/login");
  });

  test("should preserve the requested path when redirecting to login", () => {
    renderProtectedRoute(
      {
        user: null,
        loading: false,
      },
      "/dashboard"
    );

    expect(screen.getByTestId("depuis")).toHaveTextContent("/dashboard");
  });
});
