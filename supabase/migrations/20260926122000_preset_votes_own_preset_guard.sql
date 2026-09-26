-- Users may not vote on their own presets: the tally is meant to reflect other
-- people's experience, not self-approval.
--
-- Enforced in RLS rather than in the client, because the browser talks to
-- PostgREST with the anon key and RLS is the only boundary.
--
-- The `presets` subquery is evaluated with the caller's rights, and the
-- `presets` SELECT policy is public, so this does not leak any preset row --
-- it only reports whether the caller owns the preset being voted on.

DROP POLICY "Enable insert for own vote only" ON "public"."preset_votes";

CREATE POLICY "Enable insert for own vote on other presets" ON "public"."preset_votes"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (
    (auth.uid() = user_id)
    AND NOT EXISTS (
      SELECT 1
      FROM "public"."presets" p
      WHERE p.id = preset_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY "Enable update for own vote only" ON "public"."preset_votes";

CREATE POLICY "Enable update for own vote on other presets" ON "public"."preset_votes"
  FOR UPDATE
  TO "authenticated"
  USING (
    (auth.uid() = user_id)
    AND NOT EXISTS (
      SELECT 1
      FROM "public"."presets" p
      WHERE p.id = preset_id
        AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    (auth.uid() = user_id)
    AND NOT EXISTS (
      SELECT 1
      FROM "public"."presets" p
      WHERE p.id = preset_id
        AND p.user_id = auth.uid()
    )
  );

-- Withdraw is still allowed on any of your own votes: the DELETE policy is
-- unchanged on purpose, so nobody can be stuck with a vote they cannot remove.

-- Self-votes cast before this rule existed are now invalid data. The
-- on_preset_vote_sync_tallies trigger recomputes the tallies for each removal.
DELETE FROM "public"."preset_votes" v
  USING "public"."presets" p
  WHERE p.id = v.preset_id
    AND p.user_id = v.user_id;
