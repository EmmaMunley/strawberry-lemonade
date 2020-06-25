SELECT
    EXISTS (
        SELECT
            TRUE
        FROM
            users
        WHERE
            email = $1);

