import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router'
import MusicSearch from './pages/SearchMusic.jsx'
import Playlist from './assets/Playlist'

export default function App (){

    return(
        <>
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Playlist/>}/>
            <Route path="/search" element={<MusicSearch/>}/>
    
        </Routes>
        </BrowserRouter>
        </>
    )
}