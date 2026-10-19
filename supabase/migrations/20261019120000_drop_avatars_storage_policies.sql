-- The avatars bucket was never created (no bucket exists on the hosted
-- project and no code path touches storage), but the pulled remote schema
-- left three public policies on storage.objects for it. Anyone holding the
-- anon key could upload or overwrite files there if the bucket ever
-- appeared. Drop all three; if avatars are ever added, write scoped
-- policies then (e.g. INSERT only into the caller's own folder).
DROP POLICY "Anyone can upload an avatar." ON storage.objects;
DROP POLICY "Anyone can update an avatar." ON storage.objects;
DROP POLICY "Avatar images are publicly accessible." ON storage.objects;
