
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import HomeAdmin from "../pages/HomeAdmin";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  user: null,
}));

vi.mock("react-router", () => ({
  useNavigate: () => mocks.navigate,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: mocks.user,
  }),
}));

vi.mock("../components/common/Header", () => ({
  default: ({ variant, userPseudo }) => (
    <header>
      <span>{variant}</span>
      <span>{userPseudo}</span>
    </header>
  ),
}));

vi.mock("../components/common/ExplanationText", () => ({
  default: ({ title, text, hasAppTitle }) => (
    <div>
      {hasAppTitle && <span>Sonoma</span>}
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  ),
}));

vi.mock("../components/common/Button", () => ({
  default: ({ text, onClick }) => (
    <button onClick={onClick}>{text}</button>
  ),
}));

vi.mock("../components/HomeAdmin/DashboardPlaylistsContainer", () => ({
  default: ({ playlists }) => (
    <div data-testid="playlists-container">
      {playlists.length === 0 ? (
        <p>Aucune soirée</p>
      ) : (
        playlists.map((playlist) => (
          <p key={playlist.id}>{playlist.name}</p>
        ))
      )}
    </div>
  ),
}));

describe("HomeAdmin", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());

    mocks.navigate.mockReset();
    mocks.user = {
      username: "Alice",
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("should display the welcome content", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<HomeAdmin />);

    expect(
      screen.getByText("Tes invités choisissent. Toi, tu fais danser.")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Connectez votre service de streaming et invitez vos amis à proposer et voter."
      )
    ).toBeInTheDocument();

    expect(screen.getByText("Sonoma")).toBeInTheDocument();

    await screen.findByTestId("playlists-container");
  });

  test("should display the organizer username in the header", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<HomeAdmin />);

    expect(screen.getByText("Alice")).toBeInTheDocument();

    await screen.findByTestId("playlists-container");
  });

  test("should display the loading state while playlists are loading", () => {
    fetch.mockReturnValueOnce(new Promise(() => {}));

    render(<HomeAdmin />);

    expect(screen.getByText("Chargement...")).toBeInTheDocument();
    expect(
      screen.queryByTestId("playlists-container")
    ).not.toBeInTheDocument();
  });

  test("should fetch playlists from the API", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<HomeAdmin />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/playlists");
    });
  });

  test("should display the playlists returned by the API", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, name: "Soirée anniversaire" },
        { id: 2, name: "Soirée entre amis" },
      ],
    });

    render(<HomeAdmin />);

    expect(
      await screen.findByText("Soirée anniversaire")
    ).toBeInTheDocument();

    expect(screen.getByText("Soirée entre amis")).toBeInTheDocument();
  });

  test("should display an empty state when there are no playlists", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<HomeAdmin />);

    expect(await screen.findByText("Aucune soirée")).toBeInTheDocument();
  });

  test("should display an API error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Impossible de charger les soirées",
      }),
    });

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<HomeAdmin />);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Impossible de charger les soirées");

    expect(
      screen.queryByTestId("playlists-container")
    ).not.toBeInTheDocument();

    consoleError.mockRestore();
  });

  test("should display a network error", async () => {
    fetch.mockRejectedValueOnce(new Error("Erreur réseau"));

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<HomeAdmin />);

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Erreur réseau");

    consoleError.mockRestore();
  });

  test("should navigate to playlist creation when clicking the button", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<HomeAdmin />);

    await screen.findByTestId("playlists-container");

    fireEvent.click(
      screen.getByRole("button", {
        name: "Créer une nouvelle soirée",
      })
    );

    expect(mocks.navigate).toHaveBeenCalledWith("/createplaylist");
  });
});
