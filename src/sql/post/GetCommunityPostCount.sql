SELECT
    count(*) AS posts_count
FROM
    posts AS p,
    post_communities AS pc
WHERE
    pc.post_id = p.id
    AND pc.community_id = $1
