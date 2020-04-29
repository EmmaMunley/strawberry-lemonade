CREATE TABLE IF NOT EXISTS communities (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    owner_id uuid NOT NULL REFERENCES users (id),
    name text NOT NULL,
    description text,
    public boolean NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id),
    UNIQUE (name))
