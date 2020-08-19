CREATE TABLE
IF NOT EXISTS registry
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES users(id),

    first_name text NOT NULL,
    last_name text NOT NULL,

    fiance_first_name text NOT NULL,
    fiance_last_name text NOT NULL,

    event_date timestamptz NOT NULL,
    event_size text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(), 
    PRIMARY KEY(id),
    UNIQUE(user_id)
    
)
