SELECT
    id,
    email,
    image_file,
    created_at,
    CASE WHEN image_file NOTNULL THEN
        TRUE
    ELSE
        FALSE
    END AS image_exists,
    CASE WHEN EXISTS (
        SELECT
            *
        FROM
            registry
        WHERE
            id = registry.user_id) THEN
        TRUE
    ELSE
        FALSE
    END AS registry_exists
FROM
    users
WHERE
    id = $1
