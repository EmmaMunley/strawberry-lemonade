CREATE OR REPLACE VIEW members_detailed AS
SELECT
    c.name,
    u.username,
    c.owner_id,
    m.*
FROM
    communities AS c,
    users AS u,
    members AS m
WHERE
    u.id = m.user_id
    AND c.id = m.community_id;

