import './App.css'
import { Routes, Route, Navigate } from 'react-router'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistPage from './pages/Playlist.jsx'
import ProposeTab from './pages/party/ProposeTab.jsx'
import VoteTab from './pages/party/VoteTab.jsx'
import ListenTab from './pages/party/ListenTab.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ProtectedRoutes } from './components/ProtectedRoutes.jsx'
import GuestPlaylistPage from './pages/GuestPlaylist.jsx'
import GuestJoinPage from './pages/GuestJoin.jsx'

export default function App() {
  return (
    <Routes>
      {/* Authentication: no party header */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Host account */}
      <Route path="/" element={<ProtectedRoutes><HomeAdmin /></ProtectedRoutes>} />
      <Route path="/createplaylist" element={<ProtectedRoutes><CreatePlaylist /></ProtectedRoutes>} />

      {/* Host party: /playlist/:id keeps the preparation screen for now */}
      <Route path="/playlist/:id">
        <Route index element={<ProtectedRoutes><PlaylistPage /></ProtectedRoutes>} />
        <Route element={<ProtectedRoutes><PartyLayout role="host" /></ProtectedRoutes>}>
          <Route path="propose" element={<ProposeTab />} />
          <Route path="vote" element={<VoteTab />} />
          <Route path="listen" element={<ListenTab />} />
        </Route>
      </Route>

      {/* Guest party: join form, existing proposal screen, then party app */}
      <Route path="/join/:code" element={<GuestJoinPage />} />
      <Route path="/join/:code/playlist" element={<GuestPlaylistPage />} />
      <Route path="/join/:code/party">
        <Route index element={<Navigate to="propose" replace />} />
        <Route element={<PartyLayout role="guest" />}>
          <Route path="propose" element={<ProposeTab />} />
          <Route path="vote" element={<VoteTab />} />
          <Route path="listen" element={<ListenTab />} />
        </Route>
      </Route>
    </Routes>
  )
}
