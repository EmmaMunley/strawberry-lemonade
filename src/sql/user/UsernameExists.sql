SELECT
    EXISTS (
        SELECT
            TRUE
        FROM
            users
        WHERE
            username = $1);

