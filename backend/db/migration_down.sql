-- ============================================
-- DOWN MIGRATION
-- Removes all tables created by the UP migration.
-- ============================================

-- 5. Remove votes
DROP TABLE IF EXISTS votes CASCADE;

-- 4. Remove tracks
DROP TABLE IF EXISTS tracks CASCADE;

-- 3. Remove playlist guests
DROP TABLE IF EXISTS playlist_guests CASCADE;

-- 2. Remove playlists
DROP TABLE IF EXISTS playlists CASCADE;

-- 1. Remove users
DROP TABLE IF EXISTS users CASCADE;