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