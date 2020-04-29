SELECT
    mood_value,
    delta,
    submission_count,
    calculated_at
FROM
    community_moods_history
WHERE
    community_id = $1
ORDER BY
    calculated_at;

