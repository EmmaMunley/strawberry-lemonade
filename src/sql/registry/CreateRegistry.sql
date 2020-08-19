INSERT INTO registry (user_id, first_name, last_name, fiance_first_name, fiance_last_name, event_date, event_size)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING
    *;

