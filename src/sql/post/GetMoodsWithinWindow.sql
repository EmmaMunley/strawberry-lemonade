SELECT
    p.mood_value,
    p.created_at,
    pc.community_id
FROM
    posts AS p,
    post_communities AS pc
WHERE
    now() < p.created_at + $1
    AND p.id = pc.post_id;

