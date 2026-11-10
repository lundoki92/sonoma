-- Active: 1791880314981@@127.0.0.1@5433@sonoma_db
-- ============================================
-- 1. USERS
-- Stores registered host accounts.
-- ============================================

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);


-- ============================================
-- 2. PLAYLISTS
-- Stores parties created by registered hosts.
-- ============================================

CREATE TABLE playlists (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    streaming_service VARCHAR(50) NOT NULL DEFAULT 'spotify',
    invite_code VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'preparing',

    CHECK (status IN ('preparing', 'active', 'finished')),

    UNIQUE (host_id, id)
);


-- ============================================
-- 3. PLAYLIST_GUESTS
-- Stores guests who join playlists without
-- creating registered accounts.
-- Each row represents one participation.
-- The same person can join multiple playlists.
-- ============================================

CREATE TABLE playlist_guests (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    guest_name VARCHAR(50) NOT NULL,
    guest_token VARCHAR(255) NOT NULL UNIQUE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (id, playlist_id)
);


-- ============================================
-- 4. TRACKS
-- Stores Spotify tracks added by hosts or guests.
-- All tracks are directly available for voting.
-- ============================================

CREATE TABLE tracks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    guest_id INTEGER,
    external_track_id VARCHAR(255) NOT NULL,
    spotify_uri VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    image_url TEXT,
    duration_ms INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'voting',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (playlist_id, external_track_id),

    UNIQUE (id, playlist_id),

    FOREIGN KEY (guest_id, playlist_id)
        REFERENCES playlist_guests(id, playlist_id)
        ON DELETE CASCADE,

    CHECK (duration_ms > 0),

    CHECK (status IN ('proposed', 'voting', 'selected', 'played'))
);


-- ============================================
-- 5. VOTES
-- Stores votes from registered hosts and guests.
-- Each participant can vote only once per track.
-- Participants can only vote within their playlist.
-- ============================================

CREATE TABLE votes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    track_id INTEGER NOT NULL,
    playlist_id INTEGER NOT NULL,
    host_id INTEGER,
    guest_id INTEGER,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (track_id, playlist_id)
        REFERENCES tracks(id, playlist_id)
        ON DELETE CASCADE,

    FOREIGN KEY (guest_id, playlist_id)
        REFERENCES playlist_guests(id, playlist_id)
        ON DELETE CASCADE,

    FOREIGN KEY (host_id, playlist_id)
        REFERENCES playlists(host_id, id)
        ON DELETE CASCADE,

    CHECK (
        (host_id IS NOT NULL AND guest_id IS NULL)
        OR
        (host_id IS NULL AND guest_id IS NOT NULL)
    ),

    UNIQUE (host_id, track_id),

    UNIQUE (guest_id, track_id)
);