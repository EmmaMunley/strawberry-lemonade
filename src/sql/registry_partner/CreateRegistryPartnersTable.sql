CREATE TABLE
IF NOT EXISTS registry_partner
(
    user_id uuid NOT NULL REFERENCES users(id),
    registry_id uuid NOT NULL REFERENCES registry(id),
    url text NOT NULL,
    source text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(), 
    PRIMARY KEY(user_id, registry_id, source)
    
)
