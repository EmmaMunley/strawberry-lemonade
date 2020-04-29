SELECT
    EXISTS (
        SELECT
            TRUE
        FROM
            members
        WHERE
            user_id = $1
            AND community_id = $2
        LIMIT 1);

