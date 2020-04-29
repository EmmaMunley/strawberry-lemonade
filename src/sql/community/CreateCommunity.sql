INSERT INTO communities (owner_id, name, description, public)
    VALUES ($1, $2, $3, $4)
RETURNING
    *;

