# Sport Tippelő App

Baráti sport-tippelő játék: tippeld meg a 2026-os labdarúgó-vb meccseinek eredményét, gyűjts pontokat, és előzd meg a többieket a ranglistán. Először webes (mobil-első) appként készül, később natív mobilappként is.

## Fő funkciók (MVP)

- Regisztráció / belépés (Supabase Auth)
- Pontos eredmény tippelése a meccs kezdéséig
- Automatikus eredményfrissítés és pontszámítás (cron jobok)
- Dashboard élő ranglistával, saját tippek, meccsoldalak

## Dokumentáció

- [Fejlesztési terv](docs/terv.md) – fázisok, mérföldkövek, kockázatok
- [Technikai dokumentáció](docs/technikai-dokumentacio.md) – architektúra, adatbázis-séma, pontozás, cron jobok
- [Üzleti dokumentáció](docs/uzleti-dokumentacio.md) – célközönség, játékszabályok, üzleti modell, jogi megfontolások

## Stack

Next.js 15 (TypeScript, Tailwind 4) · Supabase (Postgres + Auth + RLS) · Vercel (hosting + napi cron) · GitHub Actions (5 perces eredmény-cron) · football-data.org (meccsadatok) · pnpm workspaces monorepo

```
apps/web          – Next.js alkalmazás (UI + server actions + cron route-ok)
packages/shared   – közös logika: pontszámítás, típusok (a későbbi mobilapp is ezt használja)
supabase/         – SQL migrációk (séma, RLS, pontszámító függvény)
```

## Üzembe helyezés

### 1. Supabase

1. Hozz létre projektet a [supabase.com](https://supabase.com)-on.
2. SQL Editorban futtasd le a [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql) tartalmát.
3. *Authentication → Sign In / Providers* alatt az Email provider legyen bekapcsolva. Baráti körhöz a leggyorsabb, ha a **"Confirm email" opciót kikapcsolod** (különben mindenkinek meg kell erősítenie az e-mail-címét).

### 2. football-data.org

Regisztrálj ingyenes API tokenért: <https://www.football-data.org/client/register>

### 3. Lokális futtatás

```bash
cp apps/web/.env.example apps/web/.env.local   # töltsd ki az értékeket
pnpm install
pnpm dev
```

Meccsek első betöltése (és bármikor kézi szinkron):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sync-matches
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/update-results
```

### 4. Deploy (Vercel)

1. Importáld a repót Vercelbe, **Root Directory: `apps/web`**.
2. Vidd fel az env változókat (lásd `.env.example`).
3. A napi meccs-szinkron cront a [apps/web/vercel.json](apps/web/vercel.json) definiálja (Hobby terven a napi gyakoriság a maximum).
4. Az 5 percenkénti eredményfrissítést GitHub Actions hívja ([.github/workflows/update-results.yml](.github/workflows/update-results.yml)) — állítsd be a repo secreteket: `APP_URL` (a Vercel URL) és `CRON_SECRET`.

## Tesztek

```bash
pnpm test    # pontszámítási logika (packages/shared)
```
