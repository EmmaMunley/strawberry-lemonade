CREATE TABLE IF NOT EXISTS post_communities (
    post_id uuid NOT NULL REFERENCES posts (id),
    community_id uuid NOT NULL REFERENCES communities (id),
    PRIMARY KEY (post_id, community_id))
