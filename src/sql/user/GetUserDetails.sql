SELECT
    id,
    email,
    image_file,
    created_at,
    CASE WHEN image_file NOTNULL THEN
        TRUE
    ELSE
        FALSE
    END AS image_exists
FROM
    users
WHERE
    id = $1
