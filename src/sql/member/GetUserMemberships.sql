SELECT
    community_id
FROM
    members
WHERE
    user_id = $1;

