
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";

import BottomNav from "../components/common/BottomNav";

function renderBottomNav(playlistId, initialPath) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/playlist/:id/:tab"
          element={<BottomNav playlistId={playlistId} />}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("BottomNav", () => {
  test("should display the three navigation links", () => {
    renderBottomNav(123, "/playlist/123/propose");

    expect(screen.getByRole("link", { name: "Proposer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voter" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "En écoute" })).toBeInTheDocument();
  });

  test("should generate the correct navigation URLs", () => {
    renderBottomNav(123, "/playlist/123/propose");

    expect(screen.getByRole("link", { name: "Proposer" }))
      .toHaveAttribute("href", "/playlist/123/propose");

    expect(screen.getByRole("link", { name: "Voter" }))
      .toHaveAttribute("href", "/playlist/123/vote");

    expect(screen.getByRole("link", { name: "En écoute" }))
      .toHaveAttribute("href", "/playlist/123/playlist");
  });

  test("should mark Proposer as active on the propose route", () => {
    renderBottomNav(123, "/playlist/123/propose");

    expect(screen.getByRole("link", { name: "Proposer" }))
      .toHaveClass("active");

    expect(screen.getByRole("link", { name: "Voter" }))
      .not.toHaveClass("active");

    expect(screen.getByRole("link", { name: "En écoute" }))
      .not.toHaveClass("active");
  });

  test("should mark Voter as active on the vote route", () => {
    renderBottomNav(123, "/playlist/123/vote");

    expect(screen.getByRole("link", { name: "Voter" }))
      .toHaveClass("active");

    expect(screen.getByRole("link", { name: "Proposer" }))
      .not.toHaveClass("active");
  });

  test("should mark En écoute as active on the playlist route", () => {
    renderBottomNav(123, "/playlist/123/playlist");

    expect(screen.getByRole("link", { name: "En écoute" }))
      .toHaveClass("active");

    expect(screen.getByRole("link", { name: "Proposer" }))
      .not.toHaveClass("active");
  });

  test("should use the provided playlist ID in every link", () => {
    renderBottomNav("abc123", "/playlist/abc123/propose");

    expect(screen.getByRole("link", { name: "Proposer" }))
      .toHaveAttribute("href", "/playlist/abc123/propose");

    expect(screen.getByRole("link", { name: "Voter" }))
      .toHaveAttribute("href", "/playlist/abc123/vote");

    expect(screen.getByRole("link", { name: "En écoute" }))
      .toHaveAttribute("href", "/playlist/abc123/playlist");
  });
});
