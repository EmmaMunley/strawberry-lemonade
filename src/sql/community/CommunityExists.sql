SELECT
    EXISTS (
        SELECT
            TRUE
        FROM
            communities
        WHERE
            name = $1);

