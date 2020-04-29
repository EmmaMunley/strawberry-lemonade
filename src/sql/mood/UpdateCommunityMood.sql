UPDATE
    community_moods
SET
    mood_value = $1,
    submission_count = $2,
    calculated_at = $3,
    delta = $4
WHERE
    community_id = $5
