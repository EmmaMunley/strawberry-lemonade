INSERT INTO likes (post_id, community_id, user_id)
    VALUES ($1, $2, $3)
ON CONFLICT
    DO NOTHING;

