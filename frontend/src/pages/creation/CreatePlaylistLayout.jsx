import { Outlet } from "react-router";
import CreationHeader from "./CreationHeader.jsx";
import "./CreationLayout.css";

export default function CreatePlaylistLayout({
  step,
  totalSteps = 3,
  backTo = "/",
}) {
  return (
    <div className="creation-layout">
      <CreationHeader step={step} totalSteps={totalSteps} backTo={backTo} />

      <main className="creation-content">
        <Outlet />
      </main>
    </div>
  );
}
