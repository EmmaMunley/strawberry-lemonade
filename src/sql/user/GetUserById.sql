SELECT
    *,
    CASE WHEN image_file NOTNULL THEN
        TRUE
    ELSE
        FALSE
    END AS image_exists
FROM
    users
WHERE
    id = $1
LIMIT 1;

