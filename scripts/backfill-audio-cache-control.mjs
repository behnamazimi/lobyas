// One-off: gives clips uploaded before the CDN change the same Cache-Control as
// new ones. Keys stay the same and a rerun skips what is already done.
//   node --env-file=<file with the SUPABASE_S3_* values> scripts/backfill-audio-cache-control.mjs
// (pnpm narration:backfill-cache, with those values in the environment)
import {
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const CACHE_CONTROL = "public, max-age=2592000, immutable";

const bucket = process.env.SUPABASE_S3_BUCKET;
if (!bucket) throw new Error("Missing SUPABASE_S3_BUCKET.");
console.log(`Bucket ${bucket} at ${process.env.SUPABASE_S3_ENDPOINT}`);
const client = new S3Client({
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Retries a throttled or failing call; a key that vanished meanwhile (swept)
 *  is skipped by the caller. */
async function withRetry(send) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await send();
    } catch (error) {
      const status = error.$metadata?.httpStatusCode;
      if (attempt >= 4 || !(status === 429 || status >= 500)) throw error;
      await sleep(attempt * 1000);
    }
  }
}

function isGone(error) {
  return error.name === "NoSuchKey" || error.name === "NotFound";
}

let updated = 0;
let skipped = 0;
let gone = 0;
let token;
do {
  const page = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }),
  );
  for (const { Key } of page.Contents ?? []) {
    try {
      const head = await withRetry(() =>
        client.send(new HeadObjectCommand({ Bucket: bucket, Key })),
      );
      if (head.CacheControl === CACHE_CONTROL) {
        skipped += 1;
        continue;
      }
      await withRetry(() =>
        client.send(
          new CopyObjectCommand({
            Bucket: bucket,
            Key,
            CopySource: `${bucket}/${Key}`,
            MetadataDirective: "REPLACE",
            ContentType: head.ContentType ?? "audio/mpeg",
            CacheControl: CACHE_CONTROL,
          }),
        ),
      );
      updated += 1;
    } catch (error) {
      if (!isGone(error)) throw error;
      gone += 1;
    }
  }
  token = page.NextContinuationToken;
} while (token);

console.log(`Updated ${updated}, already fine ${skipped}, gone meanwhile ${gone}.`);
