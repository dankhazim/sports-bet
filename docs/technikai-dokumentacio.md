# Technikai dokumentáció – Sport Tippelő App

> Állapot: tervezés | Utolsó frissítés: 2026-06-11

## 1. Architektúra áttekintés

Mobil-első webalkalmazás (később PWA, majd natív app), szerveroldali logikával és ütemezett feladatokkal.

```
┌─────────────────────┐
│  Next.js (Vercel)   │  ← mobil-első web UI + API route-ok / server actions
└────────┬────────────┘
         │
┌────────▼────────────┐
│  Supabase           │  ← Postgres DB + Auth + Row Level Security
│  (Postgres + Auth)  │
└────────┬────────────┘
         │
┌────────▼────────────┐     ┌──────────────────────┐
│  Cron jobok         │ ──► │  football-data.org   │  ← meccs- és eredményadatok
│  (Vercel Cron)      │     │  (külső sport API)   │
└─────────────────────┘     └──────────────────────┘
```

### Stack és indoklás

| Réteg | Választás | Miért |
|---|---|---|
| Frontend + backend | **Next.js 15 (App Router) + TypeScript** | egy kódbázis, gyors fejlesztés, server actions a mutációkhoz, Vercel-re egy kattintás a deploy |
| Stílus | **Tailwind CSS** | gyors mobil-első UI |
| Adatbázis + auth | **Supabase** (Postgres + Supabase Auth) | kész login (email + OAuth), RLS-sel biztonságos, ingyenes tier elég baráti körre, és a későbbi natív app **ugyanazt a backendet** használhatja |
| Cron | **Vercel Cron** → Next.js API route-ok | nincs külön infra; alternatíva: Supabase pg_cron + Edge Functions |
| Sport adat | **football-data.org** (ingyenes tier, vb-t tartalmazza) | egyszerű REST API; alternatíva: API-Football (api-sports.io) |
| Hosting | **Vercel** (web) + Supabase cloud | ingyenes tier, zero ops |
| Későbbi mobilapp | **Expo (React Native)** | TypeScript tudás újrahasznosul, Supabase kliens natívan megy |

A "később mindenféle sport" igény miatt a séma már most **verseny (competition) szintű absztrakcióval** készül, hogy ne kelljen migrálni.

## 2. Adatbázis séma (Postgres)

```sql
-- Supabase Auth adja az auth.users táblát; ehhez kapcsolódik:
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table competitions (
  id          bigint generated always as identity primary key,
  external_id text unique,            -- pl. football-data.org "WC" kód
  name        text not null,          -- "FIFA World Cup 2026"
  sport       text not null default 'football',
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true
);

create table teams (
  id          bigint generated always as identity primary key,
  external_id text unique,
  name        text not null,
  short_name  text,
  crest_url   text                    -- címer/zászló
);

create type match_status as enum
  ('SCHEDULED','TIMED','IN_PLAY','PAUSED','FINISHED','POSTPONED','CANCELLED');

create table matches (
  id             bigint generated always as identity primary key,
  competition_id bigint not null references competitions(id),
  external_id    text unique not null,
  home_team_id   bigint references teams(id),
  away_team_id   bigint references teams(id),
  stage          text,                -- GROUP_STAGE, ROUND_OF_32, ... FINAL
  group_name     text,                -- "Group A" (csak csoportkörben)
  kickoff_at     timestamptz not null,
  status         match_status not null default 'SCHEDULED',
  home_score     int,                 -- rendes játékidő (90 perc) végeredménye
  away_score     int,
  scored_at      timestamptz          -- mikor történt meg a pontszámítás
);

create table tips (
  id          bigint generated always as identity primary key,
  user_id     uuid   not null references profiles(id) on delete cascade,
  match_id    bigint not null references matches(id) on delete cascade,
  home_score  int    not null check (home_score between 0 and 99),
  away_score  int    not null check (away_score between 0 and 99),
  points      int,                    -- null = még nincs kiértékelve
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, match_id)
);

-- Ranglista nézet
create view leaderboard as
select p.id, p.display_name, p.avatar_url,
       coalesce(sum(t.points), 0)                  as total_points,
       count(t.points) filter (where t.points = 3) as exact_hits,
       count(t.points) filter (where t.points > 0) as correct_outcomes
from profiles p
left join tips t on t.user_id = p.id and t.points is not null
group by p.id
order by total_points desc, exact_hits desc;
```

### Row Level Security (RLS) – kulcsszabályok

- `tips`: a user **csak a saját tippjét** írhatja/módosíthatja, és csak amíg `now() < matches.kickoff_at` és a meccs `SCHEDULED/TIMED` státuszú.
- Mások tippje csak a meccs kezdése **után** olvasható (előtte ne lehessen másolni).
- `matches`, `teams`, `competitions`: mindenki olvashatja, csak a service role írhatja (cron).
- `points` mezőt csak a service role (pontszámító cron) írhatja, kliens soha.

A tipp-lezárást **a kliens, az API és az RLS is** kikényszeríti (defense in depth) — a végső őr az adatbázis.

## 3. Pontszámítási szabályok

Csak a **rendes játékidő** (90 perc + hosszabbítási idő) eredményét tippeljük, kieséses szakaszban is.

| Találat | Pont | Példa (tipp 2–1) |
|---|---|---|
| Pontos végeredmény | **5** | eredmény 2–1 |
| Kimenetel + gólkülönbség jó | **3** | eredmény 3–2 |
| Kimenetel jó + az egyik csapat gólszáma stimmel | **2** | eredmény 3–1 |
| Csak a kimenetel jó (1X2) | **1** | eredmény 3–0 |
| Rossz kimenetel | **0** | eredmény 1–1 vagy 0–1 |

Döntetlen tippnél a jó kimenetel egyben jó gólkülönbség is (0), ezért az eltalált, de nem pontos döntetlen **3 pontot** ér (pl. tipp 1–1, eredmény 2–2).

Holtverseny a ranglistán: 1. összpontszám, 2. több pontos találat, 3. több eltalált kimenetel, 4. korábbi regisztráció.

```ts
function scoreTip(tip: Score, result: Score): 0 | 1 | 2 | 3 | 5 {
  if (tip.home === result.home && tip.away === result.away) return 5;
  const tipDiff = tip.home - tip.away;
  const resDiff = result.home - result.away;
  if (Math.sign(tipDiff) !== Math.sign(resDiff)) return 0;  // rossz kimenetel
  if (tipDiff === resDiff) return 3;                        // + gólkülönbség
  if (tip.home === result.home || tip.away === result.away) return 2; // + egyik gólszám
  return 1;                                                 // csak kimenetel
}
```

`POSTPONED`/`CANCELLED` meccsre nem jár pont, a tippek érintetlenek maradnak; ha új időpontot kap, a tippelés újranyílik a friss `kickoff_at`-ig.

## 4. Cron jobok

Mindegyik egy-egy Next.js API route (`/api/cron/...`), Vercel Cron hívja, `CRON_SECRET` fejléccel védve.

| Job | Ütemezés | Feladat |
|---|---|---|
| `sync-matches` | naponta 1× (04:00 UTC) | meccsnaptár szinkron: új meccsek (kieséses ág!), időpont-változás, halasztás |
| `update-results` | 5 percenként, csak meccsablakban* | élő/befejezett meccsek lekérése; `FINISHED` → eredmény mentés + **pontszámítás** + `scored_at` beállítása |
| `send-reminders` (2. fázis) | óránként | e-mail/push azoknak, akiknek van aznap tippeletlen meccsük |

\* A `update-results` első lépésként megnézi, van-e ±3 órán belül meccs; ha nincs, azonnal kilép — így nem égetjük az API-limitet üresjáratban.

A pontszámítás **idempotens**: csak `scored_at is null` meccsekre fut, és tranzakcióban írja az összes tipp pontját. Ha az API utólag korrigál eredményt, az admin újraszámítást tud indítani.

## 5. API / oldalstruktúra

```
/                      → dashboard: ranglista + következő meccsek
/login, /register      → auth
/matches               → meccslista (csoportkör/egyenes ág, szűrés nap szerint)
/matches/[id]          → meccs részletei; kezdés után mindenki tippje
/my-tips               → saját tippek + elért pontok
/profile               → név, avatar

POST /api/tips         → tipp leadás/módosítás (szerver oldali deadline-ellenőrzés)
GET  /api/cron/sync-matches     (Vercel Cron, CRON_SECRET)
GET  /api/cron/update-results   (Vercel Cron, CRON_SECRET)
```

Mutációkhoz Next.js server actions is használható API route helyett — a lényeg, hogy a deadline- és jogosultság-ellenőrzés szerveroldalon történjen.

## 6. Külső sport API

**football-data.org** ingyenes tier: World Cup elérhető, 10 kérés/perc — baráti körnek bőven elég, mivel csak a cron hívja (a felhasználók a saját DB-nkből olvasnak).

- `GET /v4/competitions/WC/matches` – teljes meccslista státusszal és eredménnyel
- Csapatok, csoportok, fordulók ugyaninnen

Az integráció **adapter interfész** mögé kerül (`SportsDataProvider`), hogy később más sport/szolgáltató (pl. API-Football, NBA API) cserélhető legyen:

```ts
interface SportsDataProvider {
  fetchMatches(competitionExternalId: string): Promise<ExternalMatch[]>;
}
```

## 7. Biztonság

- Supabase Auth (JWT) + RLS minden táblán; service role kulcs csak szerveroldalon.
- Cron végpontok `CRON_SECRET` ellenőrzéssel.
- Tipp-deadline háromszorosan kikényszerítve (UI, szerver, RLS).
- Nincs valódi pénz az appban → nem szerencsejáték (lásd üzleti doksi).
- Secrets: `.env.local` (git-ignorálva) + Vercel environment variables.

## 8. Későbbi natív mobilapp

Az architektúra ezt előkészíti, nem igényel backend-átírást:

1. **Köztes lépés (2. fázis): PWA** – telepíthető ikon, offline shell, web push.
2. **Expo (React Native)** app a `@supabase/supabase-js` klienssel: auth és adat ugyanaz, csak az UI réteg új.
3. A megosztható logika (pontszámítás, típusok, validáció) már az MVP-ben külön `packages/shared` modulba kerül (monorepo: pnpm workspaces), így a mobilapp importálni tudja.

## 9. Repo struktúra (terv)

```
sports-bet/
├── apps/
│   └── web/                # Next.js app
│       ├── app/            # App Router oldalak + api/cron route-ok
│       ├── components/
│       └── lib/            # supabase kliens, sports-data adapter
├── packages/
│   └── shared/             # pontszámítás, típusok, validáció (web + mobil közös)
├── supabase/
│   └── migrations/         # SQL migrációk (séma + RLS)
└── docs/
```
