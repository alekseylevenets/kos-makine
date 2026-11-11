// Admin menu: Makineler · Talepler · Site ayarları
export const structure = (S) =>
  S.list()
    .title("Koş Makine")
    .items([
      S.documentTypeListItem("machine").title("Makineler").icon(() => "⚙️"),
      S.listItem()
        .title("Talepler")
        .icon(() => "📩")
        .child(
          S.list()
            .title("Talepler")
            .items([
              S.listItem().title("Yeni").icon(() => "🟠").child(
                S.documentList().title("Yeni talepler").schemaType("request").apiVersion("2025-10-01")
                  .filter('_type == "request" && status == "new"').defaultOrdering([{ field: "createdAt", direction: "desc" }])
              ),
              S.listItem().title("Tümü").icon(() => "📋").child(
                S.documentList().title("Tüm talepler").schemaType("request").apiVersion("2025-10-01")
                  .filter('_type == "request"').defaultOrdering([{ field: "createdAt", direction: "desc" }])
              ),
            ])
        ),
      S.divider(),
      S.listItem()
        .title("Site ayarları")
        .icon(() => "🛠")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings").title("Site ayarları")),
    ]);
