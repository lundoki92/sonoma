
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import CreatePlaylist from "../pages/CreatePlaylist";

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/common/Header", () => ({
  default: () => <header>Header</header>,
}));

vi.mock("../components/common/ExplanationText", () => ({
  default: ({ title, text }) => (
    <div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  ),
}));

vi.mock("../components/common/Button", () => ({
  default: ({ type, disabled, text }) => (
    <button type={type} disabled={disabled}>
      {text}
    </button>
  ),
}));

vi.mock("../components/Champ.jsx", () => ({
  Champ: ({ id, label, type, value, onChange, placeholder, required }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  ),
}));

describe("CreatePlaylist", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    mockNavigate.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function fillForm() {
    fireEvent.change(screen.getByLabelText("Nom de ma soirée"), {
      target: { value: "  Soirée anniversaire  " },
    });

    fireEvent.change(screen.getByLabelText("Date de ma soirée"), {
      target: { value: "2026-12-15T20:00" },
    });
  }

  test("should display the creation form", () => {
    render(<CreatePlaylist />);

    expect(
      screen.getByRole("heading", { name: "Créer ma soirée" })
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Nom de ma soirée")).toBeInTheDocument();
    expect(screen.getByLabelText("Date de ma soirée")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Créer la soirée" })
    ).toBeInTheDocument();
  });

  test("should send the playlist data and navigate after successful creation", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 42,
        name: "Soirée anniversaire",
        status: "preparing",
      }),
    });

    render(<CreatePlaylist />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer la soirée" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/playlists",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "Soirée anniversaire",
            date_time: new Date("2026-12-15T20:00").toISOString(),
          }),
        })
      );

      expect(mockNavigate).toHaveBeenCalledWith("/playlist/42");
    });
  });

  test("should display an error when playlist creation fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Impossible de créer la soirée",
      }),
    });

    render(<CreatePlaylist />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer la soirée" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de créer la soirée"
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should display the loading state while the request is pending", async () => {
    let resolveFetch;

    fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    render(<CreatePlaylist />);
    fillForm();

    fireEvent.click(screen.getByRole("button", { name: "Créer la soirée" }));

    expect(
      await screen.findByRole("button", { name: "Création..." })
    ).toBeDisabled();

    resolveFetch({
      ok: true,
      json: async () => ({
        id: 42,
        name: "Soirée anniversaire",
        status: "preparing",
      }),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/playlist/42");
    });
  });
});
