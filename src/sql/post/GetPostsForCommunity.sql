SELECT
    p.*,
    u.username,
    c.name AS community_name,
    CASE WHEN EXISTS (
        SELECT
            *
        FROM
            likes
        WHERE
            likes.post_id = p.id
            AND likes.community_id = c.id
            AND likes.user_id = $1) THEN
        TRUE
    ELSE
        FALSE
    END AS liked,
    CASE WHEN p.image_file NOTNULL THEN
        TRUE
    ELSE
        FALSE
    END AS image_exists,
    (
        SELECT
            count(*)
        FROM
            likes
        WHERE
            likes.post_id = p.id
            AND likes.community_id = $2)::integer AS likes
FROM
    posts AS p,
    users AS u,
    communities AS c,
    post_communities AS pc
WHERE
    p.user_id = u.id
    AND pc.post_id = p.id
    AND c.id = $2
    AND pc.community_id = c.id
LIMIT $3 offset $4;

