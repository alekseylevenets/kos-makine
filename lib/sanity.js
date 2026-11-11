import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion, hasSanity } from "../studio/env";

export const client = hasSanity
  ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" })
  : null;

// Server-only client that can write (requests form, seeding). Token never reaches the browser.
export function writeClient() {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!hasSanity || !token) return null;
  return createClient({ projectId, dataset, apiVersion, token, useCdn: false });
}
