SELECT
    a.*,
    c.name AS community_name
FROM (
    SELECT
        l.community_id,
        count(*)::integer AS likes
    FROM
        likes AS l
    WHERE
        l.post_id = $1
    GROUP BY
        l.community_id) AS a,
    communities AS c
WHERE
    a.community_id = c.id
