
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import { MemoryRouter } from "react-router";
import DashboardPlaylistsContainer from "../components/HomeAdmin/DashboardPlaylistsContainer";

describe("DashboardPlaylistsContainer", () => {
  const playlists = [
    {
      id: 1,
      name: "Soirée anniversaire",
      status: "preparing",
      date_time: "2026-12-15T20:00:00",
    },
    {
      id: 2,
      name: "Soirée d'été",
      status: "active",
      date_time: "2026-12-20T20:00:00",
    },
  ];

  function renderContainer(data = playlists) {
    return render(
      <MemoryRouter>
        <DashboardPlaylistsContainer playlists={data} />
      </MemoryRouter>
    );
  }

  test("should display the section title", () => {
    renderContainer();

    expect(
      screen.getByRole("heading", { name: "Soirées récentes" })
    ).toBeInTheDocument();
  });

  test("should display the correct number of playlists", () => {
    renderContainer();

    expect(screen.getByText("2 soirées")).toBeInTheDocument();
  });

  test("should display the singular form when there is one playlist", () => {
    renderContainer([playlists[0]]);

    expect(screen.getByText("1 soirée")).toBeInTheDocument();
  });

  test("should display all playlist cards", () => {
    renderContainer();

    expect(
      screen.getByRole("heading", { name: "Soirée anniversaire" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Soirée d'été" })
    ).toBeInTheDocument();
  });

  test("should link each playlist to its own page", () => {
    renderContainer();

    expect(
      screen.getByRole("link", { name: /Soirée anniversaire/ })
    ).toHaveAttribute("href", "/playlist/1");

    expect(
      screen.getByRole("link", { name: /Soirée d'été/ })
    ).toHaveAttribute("href", "/playlist/2");
  });

  test("should display an empty state when there are no playlists", () => {
    renderContainer([]);

    expect(
      screen.getByText(
        "Tu n'as pas encore de soirée. Crée ta première playlist !"
      )
    ).toBeInTheDocument();

    expect(screen.getByText("0 soirée")).toBeInTheDocument();
  });
});
