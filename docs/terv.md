# Fejlesztési terv – Sport Tippelő App

> Állapot: tervezés | Utolsó frissítés: 2026-06-11

## Kontextus és időnyomás

A 2026-os labdarúgó-világbajnokság **ma (2026. június 11.) elkezdődött**, és július 19-ig tart (104 meccs, 48 csapat). A csoportkör június 27-ig megy, ezért az MVP-nek **napokon belül** élesben kell lennie, hogy a baráti társaság a lehető legtöbb meccset megtippelhesse.

A stratégia: **minimális, de működő MVP gyorsan**, utána iteratív bővítés a torna alatt és után.

## Fázisok

### 1. fázis – MVP (cél: 2–3 nap, ~június 13–14.)

A cél, hogy a barátok regisztrálhassanak és tippelhessenek a hátralévő vb-meccsekre.

- [x] Projekt setup: Next.js + TypeScript + Tailwind + Supabase
- [x] Adatbázis séma létrehozása (lásd technikai dokumentáció)
- [x] Auth: regisztráció / belépés (email + jelszó)
- [x] Meccsek betöltése külső API-ból (football-data.org), egyszeri import + szinkron cron
- [x] Tippelő felület: meccslista, pontos eredmény tipp, lezárás kezdési időpontkor
- [x] Eredményfrissítő cron: lezárt meccsek eredménye + automatikus pontszámítás
- [x] Dashboard: ranglista (összpontszám, helyezés), saját tippek áttekintése
- [x] Mobil-első reszponzív UI
- [ ] Deploy (Vercel + Supabase), barátok meghívása — lásd README "Üzembe helyezés"

### 2. fázis – Finomítás a torna alatt (június 15. – július 19.)

- [ ] PWA: telepíthetőség kezdőképernyőre, app-szerű élmény
- [ ] Meccs részletoldal: mindenki tippje láthatóvá válik a kezdés után
- [ ] Tippelési emlékeztető (e-mail vagy push) a kezdés előtt X órával
- [ ] Kieséses szakasz kezelése (hosszabbítás/tizenegyesek szabályának egyértelműsítése)
- [ ] Statisztikák: találati arány, pontos tippek száma, forma az utolsó 5 meccsen
- [ ] Bónusz tippek (opcionális): gólkirály, vb-győztes a torna elején/közben

### 3. fázis – Általánosítás (a vb után)

- [ ] Több verseny/sport támogatása: a séma "competition" szintre emelése
- [ ] Privát ligák: bárki létrehozhat saját kört meghívókóddal
- [ ] Admin felület: verseny létrehozás, manuális eredményrögzítés fallbackként
- [ ] Több sport-adat szolgáltató absztrakciója (adapter réteg)

### 4. fázis – Natív mobilapp

- [ ] Expo (React Native) app, amely ugyanazt a Supabase backendet használja
- [ ] Push értesítések (eredmény, emlékeztető, ranglista-változás)
- [ ] App Store / Google Play megjelenés

## Mérföldkövek

| Mérföldkő | Cél dátum | Tartalom |
|---|---|---|
| M1 – MVP éles | 2026. jún. 14. | Login, tippelés, ranglista, automata pontszámítás |
| M2 – Torna-kész | 2026. jún. 20. | PWA, emlékeztetők, mások tippjei, statisztikák |
| M3 – Platform | 2026. ősz | Több sport, privát ligák, admin |
| M4 – Mobilapp | 2026/27 tél | Expo app store-okban |

## Kockázatok és mitigáció

| Kockázat | Hatás | Mitigáció |
|---|---|---|
| Sport-adat API limit/kimaradás | nem frissül eredmény | manuális admin rögzítés fallback; cron retry |
| MVP csúszás | kimaradó tippelhető meccsek | szigorú MVP scope, minden extra a 2. fázisba |
| Pontszabály-vita a barátok közt | bizalomvesztés | szabályok előre dokumentálva az appban (lásd üzleti doksi) |
| Halasztott/törölt meccs | rossz pontszámítás | meccs státusz kezelése (POSTPONED/CANCELLED → tipp érvénytelen) |

## Kapcsolódó dokumentumok

- [Technikai dokumentáció](technikai-dokumentacio.md)
- [Üzleti dokumentáció](uzleti-dokumentacio.md)
