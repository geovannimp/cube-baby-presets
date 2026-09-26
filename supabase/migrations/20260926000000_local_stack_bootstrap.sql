-- Local-stack bootstrap. Sorts before the remote schema snapshot (filename
-- order), so it has already run by the time the snapshot revokes CREATE.
--
-- Why this is needed:
--
-- The local stack creates the `public` schema owned by `pg_database_owner`, and
-- the local `postgres` role is NOT a superuser (rolsuper = false). Its CREATE
-- on `public` is therefore implicit: it holds the privilege only by owning the
-- database, which makes it an implicit member of `pg_database_owner`.
--
-- The snapshot revokes CREATE from `pg_database_owner` as part of Supabase's
-- public-schema hardening. Against a hosted project that is harmless, because
-- `postgres` is a superuser there and bypasses permission checks. Locally it
-- removes the only CREATE the role has, so the snapshot's next statement --
-- CREATE TABLE "public"."presets" -- fails with
-- `permission denied for schema public` and the whole reset aborts.
--
-- Granting CREATE explicitly adds its own ACL entry for `postgres`, which
-- survives the later REVOKE (that only removes the `pg_database_owner` entry).
--
-- Guarded on `rolsuper` so this is a no-op against a hosted project: it only
-- does anything on the local stack, where the role is not a superuser.

DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'postgres' AND rolsuper
  ) THEN
    EXECUTE 'GRANT CREATE, USAGE ON SCHEMA public TO postgres';
  END IF;
END
$$;
