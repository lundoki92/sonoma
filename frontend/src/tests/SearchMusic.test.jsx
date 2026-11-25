
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import SearchMusic from "../components/SearchMusic";

describe("SearchMusic", () => {
  let onAddTrack;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    onAddTrack = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function renderSearch(tracks = []) {
    return render(
      <SearchMusic onAddTrack={onAddTrack} tracks={tracks} />
    );
  }

  function fillSearch(value = "Daft Punk") {
    fireEvent.change(
      screen.getByPlaceholderText(
        "Rechercher un titre ou un artiste..."
      ),
      { target: { value } }
    );
  }

  test("should display the search form and initial message", () => {
    renderSearch();

    expect(
      screen.getByPlaceholderText(
        "Rechercher un titre ou un artiste..."
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Rechercher" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Recherchez un morceau pour afficher les résultats."
      )
    ).toBeInTheDocument();
  });

  test("should not search when the input is empty", () => {
    renderSearch();

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(fetch).not.toHaveBeenCalled();
  });

  test("should display Spotify search results", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          spotifyId: "track123",
          name: "Get Lucky",
          title: "Get Lucky",
          artist: "Daft Punk",
          cover: "https://example.com/cover.jpg",
        },
      ],
    });

    renderSearch();
    fillSearch();

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(await screen.findByText("Résultats Spotify")).toBeInTheDocument();
    expect(screen.getByText("Get Lucky")).toBeInTheDocument();
    expect(screen.getByText("Daft Punk")).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/music/search?q=Daft%20Punk")
    );
  });

  test("should display an error when the search fails", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    renderSearch();
    fillSearch();

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    expect(
      await screen.findByText("Impossible de rechercher des morceaux")
    ).toBeInTheDocument();
  });

  test("should call onAddTrack when adding a song", async () => {
    const track = {
      spotifyId: "track123",
      name: "Get Lucky",
      title: "Get Lucky",
      artist: "Daft Punk",
      cover: null,
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [track],
    });

    renderSearch();
    fillSearch();

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    const addButton = await screen.findByTitle("Ajouter le morceau");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(onAddTrack).toHaveBeenCalledWith(track);
    });
  });

  test("should disable the add button when a track is already in the playlist", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          spotifyId: "track123",
          name: "Get Lucky",
          title: "Get Lucky",
          artist: "Daft Punk",
          cover: null,
        },
      ],
    });

    renderSearch([
      {
        external_track_id: "track123",
      },
    ]);

    fillSearch();

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    const addedButton = await screen.findByTitle("Déjà ajouté");

    expect(addedButton).toBeDisabled();
    expect(addedButton).toHaveTextContent("✓");
    expect(onAddTrack).not.toHaveBeenCalled();
  });

  test("should display an error when adding a track fails", async () => {
    onAddTrack.mockRejectedValueOnce(
      new Error("Impossible d'ajouter le morceau")
    );

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          spotifyId: "track123",
          name: "Get Lucky",
          title: "Get Lucky",
          artist: "Daft Punk",
          cover: null,
        },
      ],
    });

    renderSearch();
    fillSearch();

    fireEvent.click(screen.getByRole("button", { name: "Rechercher" }));

    const addButton = await screen.findByTitle("Ajouter le morceau");
    fireEvent.click(addButton);

    expect(
      await screen.findByText("Impossible d'ajouter le morceau")
    ).toBeInTheDocument();
  });
});
