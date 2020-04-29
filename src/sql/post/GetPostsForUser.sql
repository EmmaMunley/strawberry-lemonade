SELECT DISTINCT ON (p.id)
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
            likes.post_id = p.id)::integer AS total_likes
FROM
    posts AS p,
    users AS u,
    communities AS c,
    post_communities AS pc
WHERE
    p.user_id = $1
    AND u.id = $1
    AND pc.post_id = p.id
    AND pc.community_id = c.id
LIMIT $2 OFFSET $3;

