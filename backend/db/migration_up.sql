-- Active: 1791800790239@@127.0.0.1@5433
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    -- TODO : replace with password_hash TEXT NOT NULL
    CONSTRAINT users_username_not_empty CHECK (LENGTH(TRIM(username)) > 0),
    CONSTRAINT users_email_not_empty CHECK (LENGTH(TRIM(email)) > 0)
);

CREATE TABLE playlists (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    host_id INTEGER NOT NULL,
    streaming_service VARCHAR(50) NOT NULL,

    CONSTRAINT playlists_host_fk
        FOREIGN KEY (host_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT playlists_name_not_empty
        CHECK (LENGTH(TRIM(name)) > 0),

    CONSTRAINT playlists_streaming_service_not_empty
        CHECK (LENGTH(TRIM(streaming_service)) > 0)
);

CREATE INDEX idx_playlists_host_id ON playlists(host_id);

CREATE TABLE tracks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    playlist_id INTEGER NOT NULL,

    external_track_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    image_url TEXT,
    duration_ms INTEGER NOT NULL,

    CONSTRAINT tracks_playlist_fk
        FOREIGN KEY (playlist_id)
        REFERENCES playlists(id)
        ON DELETE CASCADE,

    CONSTRAINT tracks_unique_external_id
        UNIQUE (playlist_id, external_track_id)
);