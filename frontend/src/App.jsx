import './App.css'
import { Routes, Route, Navigate } from 'react-router'
import CreatePlaylistLayout from './pages/creation/CreatePlaylistLayout.jsx'
import CreatePlaylistStep1 from './pages/creation/CreatePlaylistStep1.jsx'
import PlaylistSetup from './pages/creation/PlaylistSetup.jsx'
import PlaylistShare from './pages/creation/PlaylistShare.jsx'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistEntry from './pages/PlaylistEntry.jsx'
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

      {/* Playlist creation, step 1: no playlist exists yet */}
      <Route
        path="/createplaylist"
        element={<ProtectedRoutes><CreatePlaylistLayout step={1} backTo="/" /></ProtectedRoutes>}
      >
        <Route index element={<CreatePlaylistStep1 />} />
      </Route>

      <Route path="/playlist/:id">
        {/* Send the host to the right place depending on the status */}
        <Route index element={<ProtectedRoutes><PlaylistEntry /></ProtectedRoutes>} />

        {/* Step 1, edit mode: same screen, prefilled */}
        <Route
          element={<ProtectedRoutes><CreatePlaylistLayout step={1} backTo="setup" /></ProtectedRoutes>}
        >
          <Route path="edit" element={<CreatePlaylistStep1 />} />
        </Route>

        {/* Step 2: add the first tracks */}
        <Route
          element={<ProtectedRoutes><CreatePlaylistLayout step={2} backTo="edit" /></ProtectedRoutes>}
        >
          <Route path="setup" element={<PlaylistSetup />} />
        </Route>

        {/* Step 3: share the invitation */}
        <Route
          element={<ProtectedRoutes><CreatePlaylistLayout step={3} backTo="setup" /></ProtectedRoutes>}
        >
          <Route path="share" element={<PlaylistShare />} />
        </Route>

        {/* Host party app, outside the creation flow */}
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
