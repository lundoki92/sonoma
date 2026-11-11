import { Outlet, useParams } from "react-router";
import CreationHeader from "./CreationHeader.jsx";
import "./CreationLayout.css";

export default function CreatePlaylistLayout({
  step,
  totalSteps = 3,
  backTo = "/",
}) {
  const { id } = useParams();

  // Some steps live under /playlist/:id. `backTo` is either an absolute
  // path ("/") or the name of a sibling step ("setup", "edit", ...).
  const backTarget = backTo === "/" ? "/" : `/playlist/${id}/${backTo}`;

  return (
    <div className="creation-layout">
      <CreationHeader
        step={step}
        totalSteps={totalSteps}
        backTo={backTarget}
      />

      <main className="creation-content">
        <Outlet />
      </main>
    </div>
  );
}
