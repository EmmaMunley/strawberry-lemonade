SELECT
    c.*,
    (
        SELECT
            count(*) AS member_count
        FROM
            members AS m
        WHERE
            m.community_id = c.id)::integer AS member_count,
    (
        SELECT
            count(*) AS posts_count
        FROM
            posts AS p,
            post_communities AS pc
        WHERE
            pc.post_id = p.id
            AND pc.community_id = c.id)::integer AS post_count,
    (
        SELECT
            EXISTS (
                SELECT
                    TRUE
                FROM
                    members
                WHERE
                    members.community_id = c.id
                    AND members.user_id = $1) AS is_member)
    FROM
        communities AS c
    ORDER BY
        post_count
    LIMIT $2 OFFSET $3;

