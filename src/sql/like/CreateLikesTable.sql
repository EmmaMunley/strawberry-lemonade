CREATE TABLE IF NOT EXISTS likes (
    user_id uuid NOT NULL REFERENCES users (id),
    post_id uuid NOT NULL REFERENCES posts (id),
    community_id uuid NOT NULL REFERENCES communities (id),
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id, community_id))
