SELECT
    id AS community_id
FROM
    communities
WHERE
    name = $1
