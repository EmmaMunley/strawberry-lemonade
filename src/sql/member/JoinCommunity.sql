INSERT INTO members (user_id, community_id)
    VALUES ($1, $2)
ON CONFLICT
    DO NOTHING
RETURNING
    *;

