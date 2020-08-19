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
    AND registry_id = $2
    AND source = $3;

