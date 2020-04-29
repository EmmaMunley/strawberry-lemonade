DELETE FROM members
WHERE user_id = $1
    AND community_id = $2;

