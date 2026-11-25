
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
} from "vitest";

import Header from "../components/common/Header";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    logout: mocks.logout,
  }),
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    mocks.logout.mockResolvedValue(undefined);
  });

  // GREETING VARIANT

  test("should display the greeting and username", () => {
    render(
      <Header
        variant="greeting"
        greeting="Bonjour,"
        userPseudo="Alice Martin"
      />
    );

    expect(screen.getByText("Bonjour,")).toBeInTheDocument();
    expect(screen.getByText("Alice Martin")).toBeInTheDocument();
    expect(screen.getByText("AM")).toBeInTheDocument();
  });

  test("should display G as initials when no username is provided", () => {
    render(<Header variant="greeting" />);

    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("Invité")).toBeInTheDocument();
  });

  test("should log out and navigate to login from greeting variant", async () => {
    render(
      <Header variant="greeting" userPseudo="Alice" />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Se déconnecter" })
    );

    await waitFor(() => {
      expect(mocks.logout).toHaveBeenCalledTimes(1);
      expect(mocks.navigate).toHaveBeenCalledWith("/login", {
        replace: true,
      });
    });
  });

  // CREATION VARIANT

  test("should display the session title in creation variant", () => {
    render(
      <Header
        variant="creation"
        sessionTitle="Nouvelle soirée"
      />
    );

    expect(screen.getByText("Nouvelle soirée")).toBeInTheDocument();
  });

  test("should navigate to dashboard from creation variant", () => {
    render(<Header variant="creation" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Tableau de bord" })
    );

    expect(mocks.navigate).toHaveBeenCalledWith("/");
  });

  // GUEST VARIANT

  test("should display the party title and guest username", () => {
    render(
      <Header
        variant="guest"
        sessionTitle="Soirée anniversaire"
        userPseudo="Alice"
      />
    );

    expect(screen.getByText("Soirée anniversaire")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("Soirée en cours")).toBeInTheDocument();
  });

  test("should remove guest name and navigate when leaving the party", async () => {
    localStorage.setItem("guest_name", "Alice");

    render(
      <Header
        variant="guest"
        sessionTitle="Soirée anniversaire"
        userPseudo="Alice"
        backTo="/join"
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Quitter la soirée" })
    );

    await waitFor(() => {
      expect(mocks.logout).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("guest_name")).toBeNull();
      expect(mocks.navigate).toHaveBeenCalledWith("/join", {
        replace: true,
      });
    });
  });

  test("should navigate even if guest logout fails", async () => {
    mocks.logout.mockRejectedValueOnce(
      new Error("Déconnexion impossible")
    );

    render(
      <Header
        variant="guest"
        backTo="/playlist"
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Quitter la soirée" })
    );

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalledWith("/playlist", {
        replace: true,
      });
    });
  });

  // DEFAULT VARIANT

  test("should display the party title and username in default variant", () => {
    render(
      <Header
        sessionTitle="Soirée entre amis"
        userPseudo="Alice Martin"
      />
    );

    expect(screen.getByText("Soirée entre amis")).toBeInTheDocument();
    expect(screen.getByText("Alice Martin")).toBeInTheDocument();
    expect(screen.getByText("AM")).toBeInTheDocument();
  });

  test("should navigate to dashboard from default variant", () => {
    render(<Header sessionTitle="Ma soirée" />);

    fireEvent.click(
      screen.getByRole("button", { name: "Tableau de bord" })
    );

    expect(mocks.navigate).toHaveBeenCalledWith("/");
  });
});
