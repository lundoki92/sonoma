import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router";
import Header from "../assets/Header";
import BottomNav from "../assets/BottomNav";

export default function Home() {
  const [userPseudo, setUserPseudo] = useState("Zoé");

  return (
    <>
      <div className="host-dashboard">
        {/* HEADER FIXE */}
        <Header variant="greeting" userPseudo={userPseudo} />
      </div>
    </>
  );
}
