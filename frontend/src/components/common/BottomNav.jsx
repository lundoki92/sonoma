import { NavLink } from "react-router";
import "./BottomNav.css";

const TABS = [
  { path: "propose", icon: "fa-plus", label: "Proposer" },
  { path: "vote", icon: "fa-fire", label: "Voter" },
  { path: "listen", icon: "fa-music", label: "En écoute" },
];

export default function BottomNav({ basePath }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={`${basePath}/${path}`}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <div className="nav-icon-wrapper">
            <i className={`fa-solid ${icon} nav-icon`}></i>
          </div>
          <span className="nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
