CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    username text NOT NULL,
    password text NOT NULL,
    phone_number text NOT NULL,
    is_verified boolean NOT NULL DEFAULT FALSE,
    verification_token text,
    bio text,
    image_file text,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE (username))
