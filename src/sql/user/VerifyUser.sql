UPDATE
    users
SET
    is_verified = TRUE
WHERE
    id = $1
RETURNING
    *,
    CASE WHEN image_file NOTNULL THEN
        TRUE
    ELSE
        FALSE
    END AS image_exists;

