CREATE OR REPLACE VIEW posts_detailed AS
SELECT
    c.name AS community_name,
    u.username,
    p.*,
    (
        SELECT
            count(*)
        FROM
            likes
        WHERE
            likes.post_id = p.id) AS likes
FROM
    communities AS c,
    users AS u,
    posts AS p,
    post_communities AS pc
WHERE
    u.id = p.user_id
    AND pc.post_id = p.id
    AND c.id = pc.community_id;

