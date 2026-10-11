-- JanAwaaz PostgreSQL schema (for the future Node.js + Express backend).
-- Field names match src/lib/types.ts (camelCase there, snake_case here).

CREATE TYPE user_role AS ENUM ('citizen', 'admin');
CREATE TYPE complaint_category AS ENUM ('pothole','garbage','streetlight','water','drain','safety','other');
CREATE TYPE complaint_priority AS ENUM ('critical','high','medium','low');
CREATE TYPE complaint_status AS ENUM ('reported','verified','assigned','in_progress','resolved','reopened');
CREATE TYPE department AS ENUM ('roads','sanitation','electricity','water','drainage','emergency','general');

CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL UNIQUE,
  password    TEXT NOT NULL,              -- store a bcrypt/argon2 hash, never plain text
  role        user_role NOT NULL DEFAULT 'citizen'
);

CREATE TABLE complaints (
  id               SERIAL PRIMARY KEY,
  complaint_number VARCHAR(20) NOT NULL UNIQUE,   -- e.g. JA-2026-001248
  user_id          INTEGER NOT NULL REFERENCES users(id),
  category         complaint_category NOT NULL,
  description      TEXT NOT NULL,
  image_url        TEXT,
  latitude         DOUBLE PRECISION NOT NULL,
  longitude        DOUBLE PRECISION NOT NULL,
  address          TEXT NOT NULL,
  priority         complaint_priority NOT NULL,
  status           complaint_status NOT NULL DEFAULT 'reported',
  department       department NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_geo ON complaints(latitude, longitude);

CREATE TABLE complaint_updates (
  id           SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status       VARCHAR(20) NOT NULL,       -- complaint_status values plus 'confirmed'
  message      TEXT NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resolution_evidence (
  id           SERIAL PRIMARY KEY,
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  before_image TEXT NOT NULL,
  after_image  TEXT NOT NULL,
  latitude     DOUBLE PRECISION NOT NULL,
  longitude    DOUBLE PRECISION NOT NULL,
  timestamp    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Extra table: citizens who confirmed an existing case (duplicate merging).
CREATE TABLE complaint_followers (
  complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  PRIMARY KEY (complaint_id, user_id)
);
