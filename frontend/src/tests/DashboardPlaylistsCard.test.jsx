
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import DashboardPlaylistsCard from "../components/HomeAdmin/DashboardPlaylistsCard";

describe("DashboardPlaylistsCard", () => {
  const playlist = {
    name: "Soirée anniversaire",
    status: "preparing",
    date_time: "2026-12-15T20:00:00",
  };

  test("should display the playlist name", () => {
    render(<DashboardPlaylistsCard playlist={playlist} />);

    expect(
      screen.getByRole("heading", { name: "Soirée anniversaire" })
    ).toBeInTheDocument();
  });

  test("should display the date in French format", () => {
    render(<DashboardPlaylistsCard playlist={playlist} />);

    expect(screen.getByText(/15 décembre 2026/i)).toBeInTheDocument();
  });

  test("should display the preparing status", () => {
    render(<DashboardPlaylistsCard playlist={playlist} />);

    expect(screen.getByText("En préparation")).toBeInTheDocument();
    expect(document.querySelector(".card-preparing")).toBeInTheDocument();
  });

  test("should display the active status and arrow", () => {
    render(
      <DashboardPlaylistsCard
        playlist={{ ...playlist, status: "active" }}
      />
    );

    expect(screen.getByText("En direct")).toBeInTheDocument();
    expect(document.querySelector(".card-live")).toBeInTheDocument();
    expect(document.querySelector(".arrow-btn")).toBeInTheDocument();
  });

  test("should display the finished status", () => {
    render(
      <DashboardPlaylistsCard
        playlist={{ ...playlist, status: "finished" }}
      />
    );

    expect(screen.getByText("Terminée")).toBeInTheDocument();
    expect(document.querySelector(".card-archived")).toBeInTheDocument();
  });

  test("should display an unknown status when the status is not recognized", () => {
    render(
      <DashboardPlaylistsCard
        playlist={{ ...playlist, status: "unknown-status" }}
      />
    );

    expect(screen.getByText("Inconnue")).toBeInTheDocument();
    expect(document.querySelector(".card-unknown")).toBeInTheDocument();
  });

  test("should not display an arrow when the playlist is not active", () => {
    render(<DashboardPlaylistsCard playlist={playlist} />);

    expect(document.querySelector(".arrow-btn")).not.toBeInTheDocument();
  });
});
