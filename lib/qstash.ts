import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

export const verifyQStash = verifySignatureAppRouter({
  currentSigningKey: process.env.QSTASH_TOKEN!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY,
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
});
