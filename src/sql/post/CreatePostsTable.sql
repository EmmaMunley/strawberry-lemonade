CREATE TABLE IF NOT EXISTS posts (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    user_id uuid NOT NULL REFERENCES users (id),
    body text NOT NULL,
    image_file text,
    mood_value float NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id))
