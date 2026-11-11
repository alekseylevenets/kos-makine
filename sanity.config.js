"use client";
// Admin panel (Sanity Studio) served by the site itself at /admin.
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { trTRLocale } from "@sanity/locale-tr-tr";
import { projectId, dataset, apiVersion } from "./studio/env";
import { schemaTypes } from "./studio/schemas";
import { structure } from "./studio/structure";

const SINGLETONS = new Set(["siteSettings"]);
const NO_CREATE = new Set(["siteSettings", "request"]);

export default defineConfig({
  name: "kos-makine",
  title: "Koş Makine · Yönetim",
  basePath: "/admin",
  projectId: projectId || "missing",
  dataset,
  plugins: [structureTool({ structure }), trTRLocale()],
  schema: {
    types: schemaTypes,
    templates: (tpls) => tpls.filter(({ schemaType }) => !NO_CREATE.has(schemaType)),
  },
  document: {
    newDocumentOptions: (prev) => prev.filter((i) => !NO_CREATE.has(i.templateId)),
    actions: (prev, { schemaType }) =>
      SINGLETONS.has(schemaType) ? prev.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : prev,
  },
  apiVersion,
});
