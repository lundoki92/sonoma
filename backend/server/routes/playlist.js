import express from 'express'
import pool from '../db.js'


const routePlaylist = express.Router()

routePlaylist.get('/playlist', async (req, res, next)=> {
    try{
    const {rows} = await pool.query(`SELECT * from playlists`)

    if (rows.length === 0){
        return res.status(404).json({error: "musiques introuvable"})
    }
    res.json(rows)
    } catch(err) {
        next(err)
    }

})

export default routePlaylist