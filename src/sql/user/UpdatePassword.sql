UPDATE
    users
SET
    PASSWORD = $2
WHERE
    id = $1
