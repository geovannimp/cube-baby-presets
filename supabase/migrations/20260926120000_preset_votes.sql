-- Preset votes: one 👍/👎 per user per preset.
--
-- The tallies are denormalised onto `presets` and kept in sync by the trigger
-- below, so the presets list can page, sort and show the counts with a single
-- PostgREST query (no per-preset follow-up request and no view to embed).

CREATE TABLE "public"."preset_votes" (
  "preset_id"  bigint                   NOT NULL,
  "user_id"    uuid                     NOT NULL,
  "value"      smallint                 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  CONSTRAINT "preset_votes_pkey" PRIMARY KEY (preset_id, user_id),
  CONSTRAINT "preset_votes_value_check" CHECK (value IN (-1, 1)),
  CONSTRAINT "preset_votes_preset_id_fkey" FOREIGN KEY (preset_id) REFERENCES "public"."presets"(id) ON DELETE CASCADE,
  CONSTRAINT "preset_votes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "public"."profiles"(id) ON DELETE CASCADE
);

ALTER TABLE "public"."preset_votes"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON "public"."preset_votes"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable insert for own vote only" ON "public"."preset_votes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable update for own vote only" ON "public"."preset_votes"
  FOR UPDATE
  TO "authenticated"
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable delete for own vote only" ON "public"."preset_votes"
  FOR DELETE
  TO "authenticated"
  USING ((auth.uid() = user_id));

-- vote_score (likes - dislikes) is materialised so PostgREST can order on it:
-- PostgREST cannot order by an expression. The counts break ties, so one lone
-- vote cannot outrank a well-reviewed preset by noise alone.
ALTER TABLE "public"."presets"
  ADD COLUMN "vote_up_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "vote_down_count" integer DEFAULT 0 NOT NULL,
  ADD COLUMN "vote_score" integer DEFAULT 0 NOT NULL;

CREATE INDEX "presets_vote_score_idx"
  ON "public"."presets" (
    vote_score DESC,
    vote_up_count DESC,
    vote_down_count ASC,
    created_at DESC
  );

-- SECURITY DEFINER: the tally write targets `presets`, whose RLS only lets the
-- owner edit a row, but the vote belongs to whoever cast it. Without definer
-- rights the sync would fail for every non-owner vote.
CREATE OR REPLACE FUNCTION public.sync_preset_vote_tallies()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
begin
    update public.presets p
       set vote_up_count = tallies.ups,
           vote_down_count = tallies.downs,
           vote_score = tallies.score
      from (
        select
          count(*) filter (where v.value = 1) as ups,
          count(*) filter (where v.value = -1) as downs,
          coalesce(sum(v.value), 0) as score
          from public.preset_votes v
         where v.preset_id = coalesce(new.preset_id, old.preset_id)
      ) as tallies
     where p.id = coalesce(new.preset_id, old.preset_id);

    return null;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_preset_vote_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
begin
    new.updated_at := now();
    return new;
end;
$function$;

CREATE TRIGGER on_preset_vote_updated_at
  BEFORE UPDATE ON "public"."preset_votes"
  FOR EACH ROW
  EXECUTE FUNCTION public.set_preset_vote_updated_at();

CREATE TRIGGER on_preset_vote_sync_tallies
  AFTER INSERT OR UPDATE OR DELETE ON "public"."preset_votes"
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_preset_vote_tallies();

GRANT DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."preset_votes" TO "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."sync_preset_vote_tallies"() TO "anon", "authenticated", "service_role";

GRANT EXECUTE ON FUNCTION "public"."set_preset_vote_updated_at"() TO "anon", "authenticated", "service_role";
