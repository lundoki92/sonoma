import React, { useState, useEffect } from "react";
import "./HomeAdmin.css";
import Header from "../components/Header";
import ExplanationText from "../components/ExplanationText";
import Button from "../components/Button";

export default function Home() {
  const [userPseudo, setUserPseudo] = useState("Prénom Nom");

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
      </div>
    </>
  );
}
