import React, { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router";
import Header from "../assets/Header";
import BottomNav from "../assets/BottomNav";
import "./PartyLayout.css";

export default function PartyLayout() {
  const { id: playlistId } = useParams();
  const [partyName, setPartyName] = useState("Lovelace Night");
  const [userPseudo, setUserPseudo] = useState("Zoé");

  useEffect(() => {
    const storedGuestName = localStorage.getItem("guest_name");
    if (storedGuestName) {
      setUserPseudo(storedGuestName);
    }
  }, [playlistId]);

  return (
    <div className="party-layout">
      {/* HEADER FIXE */}
      <Header sessionTitle={partyName} userPseudo={userPseudo} />

      {/* CONTENU PRINCIPAL */}
      <main className="party-content">
        <Outlet context={{ playlistId, userPseudo }} />
      </main>

      {/* NAVIGATION STICKY */}
      <BottomNav playlistId={playlistId} />
    </div>
  );
}