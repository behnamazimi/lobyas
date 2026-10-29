-- Clips are served straight from Storage's CDN: every key ends in a job id that
-- is never reused, so the address itself is the access. Writes still go only
-- through the S3 credentials; no storage.objects policy is added.
update storage.buckets set public = true where id = 'term-narrations';
