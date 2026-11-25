
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import GuestPlaylistPage from "../pages/GuestPlaylist";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

vi.mock("react-router", () => ({
  useParams: mocks.useParams,
}));

vi.mock("../components/SearchMusic", () => ({
  default: ({ onAddTrack, tracks }) => (
    <div data-testid="search-music">
      <span data-testid="search-track-count">{tracks.length}</span>
      <button
        onClick={async () => {
          try {
            await onAddTrack({
              spotifyId: "spotify123",
              title: "Get Lucky",
              artist: "Daft Punk",
              cover: "https://example.com/cover.jpg",
              durationMs: 248000,
            });
          } catch {
            // SearchMusic gère l'erreur dans son propre composant.
          }
        }}
      >
        Ajouter un morceau test
      </button>
    </div>
  ),
}));

vi.mock("../components/common/Header", () => ({
  default: ({ sessionTitle, userPseudo, backTo }) => (
    <header data-testid="header">
      <span>{sessionTitle}</span>
      <span>{userPseudo}</span>
      <span>{backTo}</span>
    </header>
  ),
}));

vi.mock("../components/common/BottomNav", () => ({
  default: ({ playlistId }) => (
    <nav data-testid="bottom-nav">Playlist : {playlistId}</nav>
  ),
}));

vi.mock("../utils/statusLabels.js", () => ({
  PARTY_STATUS: {
    preparing: {
      label: "En préparation",
      className: "preparing",
    },
    live: {
      label: "En direct",
      className: "live",
    },
    finished: {
      label: "Terminée",
      className: "archived",
    },
  },
}));

describe("GuestPlaylistPage", () => {
  const playlist = {
    id: 42,
    name: "Soirée test",
    status: "live",
    date_time: "2026-11-24T20:00:00.000Z",
  };

  const tracks = [
    {
      id: 1,
      title: "Get Lucky",
      artist: "Daft Punk",
      image_url: "https://example.com/cover.jpg",
    },
    {
      id: 2,
      title: "One More Time",
      artist: "Daft Punk",
      image_url: null,
    },
  ];

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());

    localStorage.clear();
    localStorage.setItem("guest_name", "Alice");

    mocks.useParams.mockReturnValue({
      code: "invite123",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function mockSuccessfulLoad(
    playlistData = playlist,
    tracksData = tracks
  ) {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => playlistData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => tracksData,
      });
  }

  async function renderLoadedPage(
    playlistData = playlist,
    tracksData = tracks
  ) {
    mockSuccessfulLoad(playlistData, tracksData);

    render(<GuestPlaylistPage />);

    await screen.findByText("Morceaux de la soirée");
  }

  test("should display the loading message while fetching data", () => {
    fetch.mockReturnValue(new Promise(() => {}));

    render(<GuestPlaylistPage />);

    expect(
      screen.getByText("Chargement de la soirée...")
    ).toBeInTheDocument();
  });

  test("should fetch the playlist and its tracks", async () => {
    mockSuccessfulLoad();

    render(<GuestPlaylistPage />);

    await screen.findByText("Morceaux de la soirée");

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, "/api/invite/invite123");
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/invite/invite123/tracks"
    );
  });

  test("should display the playlist information and guest pseudo", async () => {
    await renderLoadedPage();

    expect(screen.getByTestId("header")).toHaveTextContent("Soirée test");
    expect(screen.getByTestId("header")).toHaveTextContent("Alice");
    expect(screen.getByTestId("header")).toHaveTextContent("/join/invite123");

    expect(screen.getByText("En direct")).toBeInTheDocument();
    expect(screen.getByText("2 morceaux")).toBeInTheDocument();

    expect(screen.getByTestId("bottom-nav")).toHaveTextContent(
      "Playlist : 42"
    );
  });

  test("should display the tracks returned by the API", async () => {
    await renderLoadedPage();

    expect(screen.getByText("Get Lucky")).toBeInTheDocument();
    expect(screen.getByText("One More Time")).toBeInTheDocument();

    expect(screen.getAllByText("Daft Punk")).toHaveLength(2);

    expect(screen.getByAltText("")).toHaveAttribute(
      "src",
      "https://example.com/cover.jpg"
    );
  });

  test("should display an empty message when there are no tracks", async () => {
    await renderLoadedPage(playlist, []);

    expect(
      screen.getByText("Aucun morceau pour le moment.")
    ).toBeInTheDocument();

    expect(screen.getByText("0 morceau")).toBeInTheDocument();
  });

  test("should display an error when the playlist cannot be loaded", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => tracks,
      });

    render(<GuestPlaylistPage />);

    expect(
      await screen.findByText("Cette soirée est introuvable")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("header")).not.toBeInTheDocument();
  });

  test("should display a network error when fetching fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Erreur réseau"));

    render(<GuestPlaylistPage />);

    expect(await screen.findByText("Erreur réseau")).toBeInTheDocument();
  });

  test("should not display the search component when the party is finished", async () => {
    await renderLoadedPage(
      { ...playlist, status: "finished" },
      tracks
    );

    expect(
      screen.getByText("Cette soirée est terminée.")
    ).toBeInTheDocument();

    expect(screen.queryByTestId("search-music")).not.toBeInTheDocument();

    expect(screen.getByText("Get Lucky")).toBeInTheDocument();
  });

  test("should send a new track to the API and update the playlist", async () => {
    await renderLoadedPage();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 3,
        title: "Get Lucky",
        artist: "Daft Punk",
        image_url: "https://example.com/cover.jpg",
      }),
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter un morceau test" })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/invite/invite123/tracks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            external_track_id: "spotify123",
            spotify_uri: "spotify:track:spotify123",
            title: "Get Lucky",
            artist: "Daft Punk",
            image_url: "https://example.com/cover.jpg",
            duration_ms: 248000,
          }),
        }
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Get Lucky")).toHaveLength(2);
      expect(screen.getByText("3 morceaux")).toBeInTheDocument();
    });
  });

  test("should display an error when adding a track fails", async () => {
    await renderLoadedPage();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Impossible d'ajouter ce morceau",
      }),
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Ajouter un morceau test" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Impossible d'ajouter ce morceau");
  });
});
