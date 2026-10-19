
-- ============================================
-- MIGRATION DOWN
-- Suppression des tables dans l'ordre inverse
-- de migration_up.sql
-- ============================================


-- 1. Supprimer les votes
DROP TABLE IF EXISTS votes;


-- 2. Supprimer les morceaux soumis au vote
DROP TABLE IF EXISTS voting_pool;


-- 3. Supprimer les manches de vote
DROP TABLE IF EXISTS voting_sessions;


-- 4. Supprimer les morceaux
DROP TABLE IF EXISTS tracks;


-- 5. Supprimer les invités
DROP TABLE IF EXISTS playlist_guests;


-- 6. Supprimer les playlists
DROP TABLE IF EXISTS playlists;


-- 7. Supprimer les utilisateurs (hosts)
DROP TABLE IF EXISTS users;
