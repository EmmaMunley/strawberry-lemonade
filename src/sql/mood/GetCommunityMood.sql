SELECT
    mood_value,
    delta,
    submission_count,
    calculated_at
FROM
    community_moods
WHERE
    community_id = $1;

