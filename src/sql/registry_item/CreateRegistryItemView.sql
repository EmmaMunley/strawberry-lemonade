CREATE OR REPLACE VIEW registry_item_detailed AS
SELECT
    u.email,
    r.title,
    r.price,
    r.needed,
    r.purchased,
    r.img,
    r.url,
    r.source
FROM
    registry_item AS r,
    users AS u
WHERE
    u.id = r.user_id
