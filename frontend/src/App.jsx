import './App.css'
import { Routes, Route, Navigate } from 'react-router'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import ProposeTab from './pages/party/ProposeTab.jsx'
import VoteTab from './pages/party/VoteTab.jsx'
import ListenTab from './pages/party/ListenTab.jsx'
import InviteRedirect from './pages/party/InviteRedirect.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ProtectedRoutes } from './components/ProtectedRoutes.jsx'
import GuestPlaylistPage from './pages/GuestPlaylist.jsx'
import GuestJoinPage from './pages/GuestJoin.jsx'
import CreatePlaylistLayout from './pages/creation/CreatePlaylistLayout.jsx'
import CreatePlaylistStep1 from './pages/creation/CreatePlaylistStep1.jsx'
import PlaylistSetup from './pages/creation/PlaylistSetup.jsx'
import PlaylistLaunch from './pages/creation/PlaylistLaunch.jsx'

export default function App() {
  return (
    
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/join/:code" element={<GuestJoinPage />} /> 
        <Route path="/join/:code/playlist" element={<GuestPlaylistPage />} />


        {/* Creation of a party, step 1: name, date and streaming service */}
        <Route
          path="/createplaylist"
          element={<ProtectedRoutes><CreatePlaylistLayout step={1} backTo="/" /></ProtectedRoutes>}
        >
          <Route index element={<CreatePlaylistStep1 />} />
        </Route>

        {/* Step 2: the tracks stay in memory until the last step */}
        <Route
          path="/createplaylist/setup"
          element={<ProtectedRoutes><CreatePlaylistLayout step={2} backTo="/createplaylist" /></ProtectedRoutes>}
        >
          <Route index element={<PlaylistSetup />} />
        </Route>

        {/* Step 3: the party is created here, then opened */}
        <Route
          path="/createplaylist/launch"
          element={<ProtectedRoutes><CreatePlaylistLayout step={3} backTo="/createplaylist/setup" /></ProtectedRoutes>}
        >
          <Route index element={<PlaylistLaunch />} />
        </Route>

        <Route path="/" element={<ProtectedRoutes><HomeAdmin /></ProtectedRoutes>} />

        {/* Party app: one shell (header + bottom menu), one screen per tab.
          The dashboard lands here, so the index goes to the only screen
          that is live today: Proposer. */}
        <Route
          path="/playlist/:id"
          element={<ProtectedRoutes><PartyLayout /></ProtectedRoutes>}
        >
          <Route index element={<Navigate to="propose" replace />} />
          <Route path="propose" element={<ProposeTab />} />
          <Route path="vote" element={<VoteTab />} />
          <Route path="listen" element={<ListenTab />} />
          {/* L'invitation est devenue une modale : les anciens liens restent
              valables. */}
          <Route path="invite" element={<InviteRedirect />} />
        </Route>
      </Routes>
    
  )
}