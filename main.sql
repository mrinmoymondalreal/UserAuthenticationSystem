CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION generate_ulid() RETURNS uuid
    AS $$
        SELECT (lpad(to_hex(floor(extract(epoch FROM clock_timestamp()) * 1000)::bigint), 12, '0') || encode(gen_random_bytes(10), 'hex'))::uuid;
    $$ LANGUAGE SQL;

CREATE TABLE zuth_users (
    id TEXT PRIMARY KEY DEFAULT generate_ulid(),
    username  VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tokens
(
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'verification',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expiration_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes'
);