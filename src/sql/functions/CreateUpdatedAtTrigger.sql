CREATE OR REPLACE FUNCTION create_updated_at_trigger ("table" text)
    RETURNS void
    AS $$
BEGIN
    EXECUTE FORMAT('DROP TRIGGER IF EXISTS  set_updated_at ON %I', $1);
    EXECUTE FORMAT('CREATE TRIGGER set_updated_at
                   BEFORE UPDATE ON %I
                   FOR EACH ROW
                   EXECUTE PROCEDURE trigger_set_updated_at ( )', $1);
    RETURN;
END;
$$
LANGUAGE plpgsql
VOLATILE
COST 20;

