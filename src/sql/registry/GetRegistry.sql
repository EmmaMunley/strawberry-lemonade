SELECT
    *
FROM
    registry
WHERE
    user_id = $1
LIMIT 1;

