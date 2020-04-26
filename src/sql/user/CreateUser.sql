INSERT INTO users (username, PASSWORD, phone_number, verification_token)
    VALUES ($1, $2, $3, $4)
RETURNING
    *, CASE WHEN image_file NOTNULL THEN
        TRUE
    ELSE
        FALSE
    END AS image_exists;

