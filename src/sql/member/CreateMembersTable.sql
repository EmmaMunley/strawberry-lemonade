CREATE TABLE IF NOT EXISTS members (
    user_id uuid NOT NULL REFERENCES users (id),
    community_id uuid NOT NULL REFERENCES communities (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, community_id))
