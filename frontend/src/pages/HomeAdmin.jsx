import React, { useState, useEffect } from "react";
import "./HomeAdmin.css";
import Header from "../components/Header";
import ExplanationText from "../components/ExplanationText";
import Button from "../components/Button";
import DashboardPlaylistsContainer from "../components/DashboardPlaylistsContainer";

export default function Home() {
  const [userPseudo, setUserPseudo] = useState("Prénom Nom");
    const playlists = [
    {
      id: 1,
      name: "Anniversaire de Zoé",
      date_time: "2026-11-15T20:00:00",
      status: "active",
    },
    {
      id: 2,
      name: "Soirée entre amis",
      date_time: "2026-10-30T21:00:00",
      status: "finished",
    },
    {
      id: 3,
      name: "Soirée de rentrée",
      date_time: "2026-09-12T19:30:00",
      status: "finished",
    },
  ];

  return (
    <>
      <div className="host-dashboard">
        {/* HEADER FIXE */}
        <Header variant="greeting" userPseudo={userPseudo} />

        <ExplanationText
          hasAppTitle={true}
          title="Tes invités choisissent. Toi, tu fais danser."
          text="Connectez votre service de streaming et invitez vos amis à proposer et voter."
        />

        <Button
            text="Créer une nouvelle soirée"
        />
        <DashboardPlaylistsContainer playlists={playlists}/>
      </div>
    </>
  );
}
