DELETE FROM likes
WHERE post_id = $1
    AND community_id = $2
    AND user_id = $3;

