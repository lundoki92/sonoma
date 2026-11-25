
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  vi,
} from "vitest";

import GuestJoinPage from "../pages/GuestJoin";

const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock("react-router", () => ({
  useParams: mocks.useParams,
  useNavigate: () => mocks.navigate,
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
  default: ({ text, type, disabled }) => (
    <button type={type} disabled={disabled}>
      {text}
    </button>
  ),
}));

vi.mock("../components/Champ.jsx", () => ({
  Champ: ({ id, label, value, onChange, required, maxLength }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
      />
    </div>
  ),
}));

describe("GuestJoinPage", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());

    localStorage.clear();

    mocks.useParams.mockReturnValue({
      code: "invite123",
    });

    mocks.navigate.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function fillPseudo(value = "Alice") {
    fireEvent.change(screen.getByLabelText("Ton pseudo"), {
      target: { value },
    });
  }

  test("should display the guest join form", () => {
    render(<GuestJoinPage />);

    expect(
      screen.getByText("Rejoindre la soirée")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Choisissez le pseudo que verront les autres invités."
      )
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Ton pseudo")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Rejoindre" })
    ).toBeInTheDocument();
  });

  test("should allow the guest to enter a pseudo", () => {
    render(<GuestJoinPage />);

    fillPseudo("Alice");

    expect(screen.getByLabelText("Ton pseudo")).toHaveValue("Alice");
  });

  test("should send the pseudo to the API", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<GuestJoinPage />);

    fillPseudo("Alice");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/invite/invite123/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            guest_name: "Alice",
          }),
        }
      );
    });
  });

  test("should trim the pseudo before sending it", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<GuestJoinPage />);

    fillPseudo("  Alice  ");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            guest_name: "Alice",
          }),
        })
      );
    });
  });

  test("should save the pseudo and navigate after a successful join", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<GuestJoinPage />);

    fillPseudo("Alice");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    await waitFor(() => {
      expect(localStorage.getItem("guest_name")).toBe("Alice");
      expect(mocks.navigate).toHaveBeenCalledWith(
        "/join/invite123/playlist"
      );
    });
  });

  test("should display an API error", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "Cette invitation est invalide",
      }),
    });

    render(<GuestJoinPage />);

    fillPseudo("Alice");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Cette invitation est invalide");

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(localStorage.getItem("guest_name")).toBeNull();
  });

  test("should display a default error when the API does not provide one", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<GuestJoinPage />);

    fillPseudo("Alice");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Impossible de rejoindre la soirée");
  });

  test("should display the loading state while the request is pending", async () => {
    let resolveRequest;

    fetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<GuestJoinPage />);

    fillPseudo("Alice");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    expect(
      await screen.findByRole("button", { name: "..." })
    ).toBeDisabled();

    resolveRequest({
      ok: true,
      json: async () => ({ success: true }),
    });

    await waitFor(() => {
      expect(mocks.navigate).toHaveBeenCalled();
    });
  });

  test("should reset the loading state when the request fails", async () => {
    fetch.mockRejectedValueOnce(new Error("Erreur réseau"));

    render(<GuestJoinPage />);

    fillPseudo("Alice");

    fireEvent.click(
      screen.getByRole("button", { name: "Rejoindre" })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Erreur réseau"
    );

    expect(
      screen.getByRole("button", { name: "Rejoindre" })
    ).toBeEnabled();
  });
});
