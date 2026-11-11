import { defineType, defineField, defineArrayMember } from "sanity";

export const TYPES = [
  { title: "Atlet poşet", value: "tshirt" },
  { title: "Dipten kaynak", value: "bottom" },
  { title: "Yandan kaynak", value: "side" },
  { title: "Çöp torbası", value: "garbage" },
  { title: "Ekstrüder", value: "extruder" },
];
const TYPE_TITLE = Object.fromEntries(TYPES.map((t) => [t.value, t.title]));

export const slugify = (s) =>
  String(s || "").toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const tr = (name, title, opts = {}) => defineField({ name, title, type: "string", ...opts });

export default defineType({
  name: "machine",
  title: "Makine",
  type: "document",
  groups: [
    { name: "main", title: "Genel", default: true },
    { name: "photos", title: "Fotoğraflar" },
    { name: "price", title: "Fiyat" },
    { name: "specs", title: "Teknik özellikler" },
    { name: "text", title: "Açıklama" },
  ],
  fields: [
    defineField({
      name: "name", title: "Makine adı", type: "object", group: "main",
      options: { columns: 2 },
      fields: [
        tr("tr", "Türkçe", { validation: (r) => r.required().error("Türkçe ad gerekli") }),
        tr("en", "English"),
      ],
    }),
    defineField({
      name: "slug", title: "Sayfa adresi (URL)", type: "slug", group: "main",
      description: "Adın altındaki «Generate / Oluştur» butonuna basın. Yayından sonra değiştirmeyin.",
      options: { source: "name.tr", slugify, maxLength: 80 },
      validation: (r) => r.required().error("URL gerekli: «Oluştur» butonuna basın"),
    }),
    defineField({
      name: "type", title: "Makine tipi", type: "string", group: "main",
      options: { list: TYPES, layout: "radio" }, initialValue: "tshirt",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "cond", title: "Durum", type: "string", group: "main",
      options: { list: [{ title: "Yeni", value: "new" }, { title: "İkinci el", value: "used" }], layout: "radio", direction: "horizontal" },
      initialValue: "new", validation: (r) => r.required(),
    }),
    defineField({ name: "published", title: "Sitede göster", type: "boolean", group: "main", initialValue: true,
      description: "Kapalıysa makine sitede görünmez, ama silinmez." }),
    defineField({ name: "featured", title: "Ana sayfada öne çıkar", type: "boolean", group: "main", initialValue: false }),
    defineField({ name: "order", title: "Sıra", type: "number", group: "main",
      description: "Küçük sayı önce gösterilir (1, 2, 3…). Boş bırakılırsa sona eklenir." }),

    defineField({
      name: "photos", title: "Fotoğraflar", type: "array", group: "photos",
      description: "İlk fotoğraf ana fotoğraftır. Sürükleyerek sırayı değiştirin. Kare (1:1) veya yatay fotoğraf önerilir.",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
      options: { layout: "grid" },
      validation: (r) => r.max(12),
    }),

    defineField({ name: "price", title: "Fiyat", type: "string", group: "price", initialValue: "000 000",
      description: "Örn: 45 000. Boş bırakılırsa «Talep üzerine» yazılır." }),
    defineField({
      name: "currency", title: "Para birimi", type: "string", group: "price", initialValue: "$",
      options: { list: ["$", "€", "₺"], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "onRequest", title: "Fiyatı gizle, «Talep üzerine» göster", type: "boolean", group: "price", initialValue: false }),

    tr("model", "Model", { group: "specs" }),
    tr("year", "Yıl", { group: "specs" }),
    tr("width", "Poşet eni (mm)", { group: "specs", description: "Örn: 160–450" }),
    tr("length", "Poşet boyu (mm)", { group: "specs", description: "Ekstrüder için «—»" }),
    tr("thick", "Film kalınlığı (µm)", { group: "specs", description: "Örn: 7–40" }),
    tr("speed", "Üretim hızı", { group: "specs", description: "Sadece sayı: «≤ 250» → adet/dk. Ekstrüder: «≤ 60 kg/h»" }),
    tr("power", "Motor gücü (kW)", { group: "specs" }),

    defineField({
      name: "desc", title: "Açıklama", type: "object", group: "text",
      fields: [
        defineField({ name: "tr", title: "Türkçe", type: "text", rows: 6 }),
        defineField({ name: "en", title: "English", type: "text", rows: 6 }),
      ],
    }),
  ],
  orderings: [
    { title: "Sıra", name: "order", by: [{ field: "order", direction: "asc" }] },
    { title: "Son eklenen", name: "created", by: [{ field: "_createdAt", direction: "desc" }] },
    { title: "Ada göre", name: "name", by: [{ field: "name.tr", direction: "asc" }] },
  ],
  preview: {
    select: { title: "name.tr", model: "model", type: "type", cond: "cond", pub: "published", media: "photos.0" },
    prepare: ({ title, model, type, cond, pub, media }) => ({
      title: (pub === false ? "⏸ " : "") + (title || "Yeni makine"),
      subtitle: [model, TYPE_TITLE[type], cond === "used" ? "İkinci el" : "Yeni"].filter(Boolean).join(" · "),
      media,
    }),
  },
});
