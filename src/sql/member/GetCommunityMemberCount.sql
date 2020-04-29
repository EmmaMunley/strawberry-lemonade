SELECT
    count(*) AS member_count
FROM
    members AS m
WHERE
    m.community_id = $1
