# Koş Makine: сайт + админка

- **Сайт:** `/tr` и `/en` (главная, каталог `/makineler`, страница станка `/makineler/<адрес>`)
- **Админка:** `/admin` (Sanity Studio на турецком: Makineler · Talepler · Site ayarları)
- Стек: Next.js 16 + Sanity (бесплатный тариф) + Vercel

Пока Sanity не подключён, сайт показывает 12 демо-станков из `lib/content.js`, а форма заявки предлагает WhatsApp.

---

## 1. Загрузить код на GitHub

1. Распакуйте архив.
2. Откройте https://github.com/alekseylevenets/kos-makine, ссылка **uploading an existing file**.
3. Перетащите **содержимое** папки `kos-makine` (не саму папку): `app`, `components`, `lib`, `public`, `studio`, `styles`, `package.json`, `package-lock.json`, `next.config.mjs`, `sanity.config.js`, `jsconfig.json`, `.gitignore`, `.env.example`, `README.md`.
   Файлы с точкой (`.gitignore`, `.env.example`) на Mac скрыты: в Finder нажмите `Cmd + Shift + .`
4. **Commit changes**.

## 2. Создать проект Sanity (база + вход в админку)

1. https://www.sanity.io/manage → войти (Google или GitHub) → **Create new project**.
   Название: `Koş Makine`, dataset: `production`, видимость **Public**.
2. Скопируйте **Project ID** (8 символов, вида `ab12cd34`).
3. **API → Tokens → Add API token**: имя `site`, права **Editor** → скопируйте токен (показывается один раз, никому не пересылайте).

## 3. Опубликовать на Vercel

1. https://vercel.com/new → **Import** репозиторий `kos-makine`.
2. Перед **Deploy** раскройте **Environment Variables** и добавьте:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project ID из шага 2 |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_WRITE_TOKEN` | токен из шага 2 |
| `SEED_SECRET` | любая длинная строка, например `kos-2026-import-7x9q` |
| `NEXT_PUBLIC_SITE_URL` | `https://kosmakine.com` (или адрес vercel.app, пока нет домена) |

3. **Deploy**. Получите адрес вида `kos-makine.vercel.app`.

## 4. Разрешить админке работать на этом адресе

sanity.io/manage → проект → **API → CORS origins → Add CORS origin**:
- `https://kos-makine.vercel.app` (ваш адрес), галочка **Allow credentials** ✔
- позже то же самое для `https://kosmakine.com` и `https://www.kosmakine.com`

## 5. Залить 12 демо-станков в базу (один раз)

Откройте в браузере:

```
https://kos-makine.vercel.app/api/seed?secret=ВАШ_SEED_SECRET
```

Ответ `{"ok":true,...}` = станки и настройки в базе. Через минуту они на сайте и в админке.

## 6. Админка

`https://kos-makine.vercel.app/admin` → вход тем же аккаунтом, что в Sanity.

Клиента добавить: sanity.io/manage → проект → **Members → Invite** (роль **Editor**). Он входит через свою почту Google.

- **Makineler**: добавить / изменить станок. Фото: первое = главное, порядок перетаскиванием. Кнопка **Publish** внизу, без неё изменения не видны.
- **Talepler**: заявки с формы сайта (🟠 новые, 🔵 просмотрены, ✅ готово).
- **Site ayarları**: телефон, WhatsApp, e-mail, Instagram, адрес, налоговые данные.

Изменения появляются на сайте в течение ~1 минуты.

## 7. Домен kosmakine.com

Vercel → проект → **Settings → Domains → Add** `kosmakine.com` → у регистратора домена прописать записи, которые покажет Vercel. Затем добавить домен в CORS (шаг 4) и поменять `NEXT_PUBLIC_SITE_URL` → **Redeploy**.

## Стоимость

- Sanity Free: 0 $ (для 40–50 станков и заявок хватает с запасом).
- Vercel Hobby: 0 $, но только для некоммерческих сайтов. Для сайта компании по правилам Vercel нужен **Pro: 20 $/мес**.

## Локальный запуск (необязательно)

```
npm install
cp .env.example .env.local   # заполнить
npm run dev                  # http://localhost:3000
```
