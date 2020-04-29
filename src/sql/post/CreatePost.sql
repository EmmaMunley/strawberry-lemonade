INSERT INTO posts (user_id, body, mood_value, image_file)
    VALUES ($1, $2, $3, $4)
RETURNING
    id AS post_id;

