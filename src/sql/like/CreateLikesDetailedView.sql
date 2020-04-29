CREATE OR REPLACE VIEW likes_detailed AS
SELECT
    c. name AS community_name,
    u.username,
    l.*,
    p.body,
    p.mood_value,
    p.image_file
FROM
    communities AS c,
    users AS u,
    posts AS p,
    likes AS l
WHERE
    u.id = l.user_id
    AND p.id = l.post_id
    AND l.community_id = c.id
