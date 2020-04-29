INSERT INTO community_moods (community_id, mood_value, submission_count, calculated_at, delta)
    VALUES ($1, $2, $3, $4, $5)
RETURNING
    *;

