DELETE FROM registry_item
WHERE user_id = $1
    AND registry_id = $2
