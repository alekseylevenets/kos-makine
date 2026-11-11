import { defineType, defineField } from "sanity";

export const STATUS = [
  { title: "Yeni", value: "new" },
  { title: "Görüldü", value: "seen" },
  { title: "Tamamlandı", value: "done" },
];
const ICON = { new: "🟠", seen: "🔵", done: "✅" };

export default defineType({
  name: "request",
  title: "Talep",
  type: "document",
  fields: [
    defineField({ name: "status", title: "Durum", type: "string", initialValue: "new",
      options: { list: STATUS, layout: "radio", direction: "horizontal" } }),
    defineField({ name: "name", title: "Ad Soyad / Firma", type: "string", readOnly: true }),
    defineField({ name: "phone", title: "Telefon", type: "string", readOnly: true }),
    defineField({ name: "machineName", title: "Makine", type: "string", readOnly: true }),
    defineField({ name: "machine", title: "Makine adresi", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "msg", title: "Mesaj", type: "text", rows: 5, readOnly: true }),
    defineField({ name: "lang", title: "Dil", type: "string", readOnly: true }),
    defineField({ name: "page", title: "Gönderildiği sayfa", type: "string", readOnly: true }),
    defineField({ name: "createdAt", title: "Tarih", type: "datetime", readOnly: true }),
    defineField({ name: "note", title: "Not (sadece sizin için)", type: "text", rows: 3 }),
  ],
  orderings: [{ title: "Yeni önce", name: "date", by: [{ field: "createdAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", phone: "phone", machine: "machineName", status: "status", date: "createdAt" },
    prepare: ({ name, phone, machine, status, date }) => ({
      title: `${ICON[status] || "🟠"} ${name || "—"}`,
      subtitle: [phone, machine || "Genel talep", date ? new Date(date).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""].filter(Boolean).join(" · "),
    }),
  },
});
