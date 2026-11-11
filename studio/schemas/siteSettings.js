import { defineType, defineField } from "sanity";

const s = (name, title, opts = {}) => defineField({ name, title, type: "string", ...opts });

export default defineType({
  name: "siteSettings",
  title: "Site ayarları",
  type: "document",
  groups: [
    { name: "contact", title: "İletişim", default: true },
    { name: "legal", title: "Yasal bilgiler" },
  ],
  fields: [
    s("person", "Yetkili", { group: "contact" }),
    s("phone", "Telefon", { group: "contact", description: "Örn: +90 533 479 24 58" }),
    s("whatsapp", "WhatsApp numarası", { group: "contact", description: "Sadece rakam, ülke koduyla: 905334792458" }),
    s("email", "E-posta", { group: "contact" }),
    s("instagram", "Instagram kullanıcı adı", { group: "contact", description: "@ olmadan. Boş bırakılırsa gizlenir." }),
    defineField({
      name: "address", title: "Adres", type: "object", group: "contact",
      fields: [s("tr", "Türkçe"), s("en", "English")],
    }),
    s("mapUrl", "Google Haritalar linki", { group: "contact" }),
    defineField({
      name: "legal", title: "Yasal bilgiler", type: "object", group: "legal",
      fields: [s("vd", "Vergi Dairesi"), s("vn", "Vergi No"), s("mersis", "MERSİS No"), s("sicil", "Ticaret Sicil No")],
    }),
  ],
  preview: { prepare: () => ({ title: "Site ayarları" }) },
});
