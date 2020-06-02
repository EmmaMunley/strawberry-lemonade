SELECT
    source,
    url
FROM
    registry
WHERE
    user_id = $1
