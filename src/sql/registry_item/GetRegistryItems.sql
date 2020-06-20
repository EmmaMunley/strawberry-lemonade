SELECT
    title,
    price,
    needed,
    purchased,
    img,
    url,
    source
FROM
    registry_item
WHERE
    user_id = $1
    AND source = $2;

