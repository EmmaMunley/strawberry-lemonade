CREATE TABLE IF NOT EXISTS community_moods (
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    community_id uuid NOT NULL REFERENCES communities (id),
    mood_value float NOT NULL,
    delta float NOT NULL DEFAULT 0,
    submission_count integer NOT NULL,
    calculated_at timestamptz NOT NULL DEFAULT NOW(),
    PRIMARY KEY (id))
