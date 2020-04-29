DO $$
DECLARE
    table_names text ARRAY DEFAULT ARRAY['users', 'communities', 'posts'];
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY table_names LOOP
        EXECUTE create_updated_at_trigger (table_name);
    END LOOP;
END;
$$
LANGUAGE 'plpgsql';

