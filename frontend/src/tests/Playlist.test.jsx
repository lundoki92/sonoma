
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import PlaylistPage from "../pages/Playlist";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("react-router", () => ({
  useParams: mocks.useParams,
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("../components/common/Header", () => ({
  default: ({ sessionTitle, userPseudo }) => (
    <header>
      <span>{sessionTitle}</span>
      <span>{userPseudo}</span>
    </header>
  ),
}));

vi.mock("../components/common/BottomNav", () => ({
  default: ({ playlistId }) => (
    <nav data-testid="bottom-nav" data-playlist-id={playlistId} />
  ),
}));

vi.mock("../components/common/Button", () => ({
  default: ({ text, disabled }) => (
    <button disabled={disabled}>{text}</button>
  ),
}));

vi.mock("../components/SearchMusic", () => ({
  default: ({ onAddTrack }) => (
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
          // SearchMusic gère lui-même l'erreur.
        }
      }}
    >
      Ajouter une piste test
    </button>
  ),
}));

describe("PlaylistPage", () => {
  const playlist = {
    id: "playlist123",
    name: "Lovelace Night",
    status: "preparing",
    date_time: "2026-12-01T20:00:00.000Z",
    invite_code: "invite123",
  };

  const track = {
    id: "track1",
    external_track_id: "spotify123",
    title: "Get Lucky",
    artist: "Daft Punk",
    image_url: "https://example.com/cover.jpg",
  };

  function mockFetchSuccess(
    playlistData = playlist,
    tracksData = []
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

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());

    mocks.useParams.mockReturnValue({ id: "playlist123" });
    mocks.useAuth.mockReturnValue({
      user: { username: "Alice" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete navigator.clipboard;
    delete document.execCommand;
  });

  test("should display the loading message", () => {
    fetch.mockReturnValue(new Promise(() => {}));

    render(<PlaylistPage />);

    expect(
      screen.getByText("Chargement de la soirée...")
    ).toBeInTheDocument();
  });

  test("should fetch the playlist and its tracks", async () => {
    mockFetchSuccess();

    render(<PlaylistPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      "/api/playlists/playlist123"
    );

    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "/api/playlists/playlist123/tracks"
    );
  });

  test("should display the playlist information", async () => {
    mockFetchSuccess();

    render(<PlaylistPage />);

    expect(
      await screen.findByText("Lovelace Night")
    ).toBeInTheDocument();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("En préparation")).toBeInTheDocument();
    expect(screen.getByText("0 morceau")).toBeInTheDocument();
  });

  test("should display an error when loading fails", async () => {
    fetch
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<PlaylistPage />);

    expect(
      await screen.findByText("Impossible de charger la soirée")
    ).toBeInTheDocument();
  });

  test("should display the tracks already in the playlist", async () => {
    mockFetchSuccess(playlist, [track]);

    render(<PlaylistPage />);

    expect(
      await screen.findByText("Get Lucky")
    ).toBeInTheDocument();

    expect(screen.getByText("Daft Punk")).toBeInTheDocument();
    expect(screen.getByText("1 morceau")).toBeInTheDocument();
  });

  test("should display the empty state when there are no tracks", async () => {
    mockFetchSuccess();

    render(<PlaylistPage />);

    expect(
      await screen.findByText(
        "Aucun morceau ajouté pour le moment."
      )
    ).toBeInTheDocument();
  });

  test("should disable voting when the party is preparing", async () => {
    mockFetchSuccess();

    render(<PlaylistPage />);

    const voteButton = await screen.findByRole("button", {
      name: "Soumettre au vote",
    });

    expect(voteButton).toBeDisabled();

    expect(
      screen.getByText(
        "Le vote sera disponible une fois la soirée démarrée."
      )
    ).toBeInTheDocument();
  });

  test("should enable voting when the party is active", async () => {
    mockFetchSuccess({
      ...playlist,
      status: "active",
    });

    render(<PlaylistPage />);

    const voteButton = await screen.findByRole("button", {
      name: "Soumettre au vote",
    });

    expect(voteButton).toBeEnabled();

    expect(
      screen.queryByText(
        "Le vote sera disponible une fois la soirée démarrée."
      )
    ).not.toBeInTheDocument();
  });

  test("should add a track to the playlist", async () => {
    mockFetchSuccess();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => track,
    });

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Ajouter une piste test",
      })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    expect(fetch).toHaveBeenNthCalledWith(
      3,
      "/api/playlists/playlist123/tracks",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    const requestBody = JSON.parse(fetch.mock.calls[2][1].body);

    expect(requestBody).toEqual({
      external_track_id: "spotify123",
      spotify_uri: "spotify:track:spotify123",
      title: "Get Lucky",
      artist: "Daft Punk",
      image_url: "https://example.com/cover.jpg",
      duration_ms: 248000,
    });

    expect(await screen.findByText("Get Lucky")).toBeInTheDocument();
  });

  test("should display an error when adding a track fails", async () => {
    mockFetchSuccess();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Impossible d'ajouter ce morceau",
      }),
    });

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Ajouter une piste test",
      })
    );

    expect(
      await screen.findByText("Impossible d'ajouter ce morceau")
    ).toBeInTheDocument();
  });

  test("should display the invite link", async () => {
    mockFetchSuccess();

    render(<PlaylistPage />);

    expect(
      await screen.findByText(/invite123/)
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Copier" })
    ).toBeInTheDocument();
  });

  test("should pass the playlist ID to BottomNav", async () => {
    mockFetchSuccess();

    render(<PlaylistPage />);

    await screen.findByText("Lovelace Night");

    expect(screen.getByTestId("bottom-nav")).toHaveAttribute(
      "data-playlist-id",
      "playlist123"
    );
  });

  // INVITE LINK COPYING TESTS

  test("should copy the invite link using the clipboard API", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    mockFetchSuccess();

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Copier" })
    );

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(
        "http://127.0.0.1:5173/join/invite123"
      );
    });

    expect(
      await screen.findByRole("button", { name: "Copié !" })
    ).toBeInTheDocument();
  });

  test("should use the fallback when clipboard API is unavailable", async () => {
    delete navigator.clipboard;

    const execCommandMock = vi.fn().mockReturnValue(true);

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommandMock,
    });

    mockFetchSuccess();

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Copier" })
    );

    await waitFor(() => {
      expect(execCommandMock).toHaveBeenCalledWith("copy");
    });

    expect(
      await screen.findByRole("button", { name: "Copié !" })
    ).toBeInTheDocument();

    expect(document.querySelector("textarea")).toBeNull();
  });

  test("should use the fallback when clipboard API fails", async () => {
    const writeTextMock = vi.fn().mockRejectedValue(
      new Error("Clipboard unavailable")
    );

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    const execCommandMock = vi.fn().mockReturnValue(true);

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: execCommandMock,
    });

    mockFetchSuccess();

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Copier" })
    );

    await waitFor(() => {
      expect(execCommandMock).toHaveBeenCalledWith("copy");
    });

    expect(
      await screen.findByRole("button", { name: "Copié !" })
    ).toBeInTheDocument();
  });

  test("should display an error when both copy methods fail", async () => {
    delete navigator.clipboard;

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });

    mockFetchSuccess();

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Copier" })
    );

    expect(
      await screen.findByRole("button", { name: "Erreur" })
    ).toBeInTheDocument();
  });

  test("should display an error when the fallback throws", async () => {
    delete navigator.clipboard;

    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn(() => {
        throw new Error("Copy failed");
      }),
    });

    mockFetchSuccess();

    render(<PlaylistPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Copier" })
    );

    expect(
      await screen.findByRole("button", { name: "Erreur" })
    ).toBeInTheDocument();
  });
});
