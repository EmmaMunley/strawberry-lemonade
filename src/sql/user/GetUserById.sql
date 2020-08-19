SELECT
    u.*,
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
            u.id = registry.user_id) THEN
        TRUE
    ELSE
        FALSE
    END AS registry_exists
FROM
    users AS u
WHERE
    id = $1
LIMIT 1;

