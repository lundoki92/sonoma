
import { render, screen, waitFor } from "@testing-library/react";
import {
  describe,
  test,
  expect,
  beforeEach,
  vi,
} from "vitest";

import PartyLayout from "../pages/PartyLayout";

// Mock useParams et les composants de React Router
const mocks = vi.hoisted(() => ({
  useParams: vi.fn(),
}));

vi.mock("react-router", () => ({
  useParams: mocks.useParams,

  Outlet: ({ context }) => (
    <div
      data-testid="outlet"
      data-playlist-id={context.playlistId}
      data-user-pseudo={context.userPseudo}
    />
  ),
}));

// Mock des composants enfants
vi.mock("../components/common/Header", () => ({
  default: ({ sessionTitle, userPseudo }) => (
    <div data-testid="header">
      <span>{sessionTitle}</span>
      <span>{userPseudo}</span>
    </div>
  ),
}));

vi.mock("../components/common/BottomNav", () => ({
  default: ({ playlistId }) => (
    <div data-testid="bottom-nav" data-playlist-id={playlistId} />
  ),
}));

describe("PartyLayout", () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.useParams.mockReturnValue({ id: "playlist123" });
  });

  test("should render the layout components", () => {
    render(<PartyLayout />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("outlet")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });

  test("should display the default party name and pseudo", () => {
    render(<PartyLayout />);

    expect(screen.getByText("Lovelace Night")).toBeInTheDocument();
    expect(screen.getByText("Zoé")).toBeInTheDocument();
  });

  test("should retrieve the guest pseudo from localStorage", async () => {
    localStorage.setItem("guest_name", "Alice");

    render(<PartyLayout />);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });
  });

  test("should pass the playlist ID to Outlet", () => {
    render(<PartyLayout />);

    expect(screen.getByTestId("outlet")).toHaveAttribute(
      "data-playlist-id",
      "playlist123"
    );
  });

  test("should pass the guest pseudo to Outlet", async () => {
    localStorage.setItem("guest_name", "Alice");

    render(<PartyLayout />);

    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toHaveAttribute(
        "data-user-pseudo",
        "Alice"
      );
    });
  });

  test("should pass the playlist ID to BottomNav", () => {
    render(<PartyLayout />);

    expect(screen.getByTestId("bottom-nav")).toHaveAttribute(
      "data-playlist-id",
      "playlist123"
    );
  });
});
