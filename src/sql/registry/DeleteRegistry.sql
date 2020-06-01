DELETE FROM registry
WHERE user_id = $1
    AND source = $2
