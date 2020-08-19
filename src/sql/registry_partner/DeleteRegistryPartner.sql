DELETE FROM registry_partner
WHERE user_id = $1
    AND registry_id = $2
    AND source = $3
