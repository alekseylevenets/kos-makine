// Sanity connection. Values come from environment variables (Vercel → Settings → Environment Variables).
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2025-10-01";
export const hasSanity = /^[a-z0-9]+$/.test(projectId);
