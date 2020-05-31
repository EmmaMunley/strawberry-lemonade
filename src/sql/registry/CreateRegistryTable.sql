CREATE TABLE
IF NOT EXISTS registry
(
    user_id uuid NOT NULL REFERENCES users(id),
    url text NOT NULL,
    source text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(), 
    PRIMARY KEY(user_id, source)
    
)
