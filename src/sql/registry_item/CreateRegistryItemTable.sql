CREATE TABLE
IF NOT EXISTS registry_item
(
    user_id uuid NOT NULL REFERENCES users(id),
    registry_id uuid NOT NULL REFERENCES registry(id),

    title text NOT NULL,
    price float NOT NULL,
    needed int NOT NULL,
    purchased int NOT NULL,
    img text NOT NULL,
    url text NOT NULL,
    source text NOT NULL,

    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(), 
    PRIMARY KEY(user_id, registry_id, url)
)
