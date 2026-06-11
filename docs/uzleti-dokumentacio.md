# Üzleti dokumentáció – Sport Tippelő App

> Állapot: tervezés | Utolsó frissítés: 2026-06-11

## 1. Vízió

Egy baráti társaságoknak szóló sport-tippelő platform, ahol a tagok megtippelik a meccsek eredményét, és a torna végén a legpontosabb tippelő nyeri a versenyt. Első körben a **2026-os labdarúgó-világbajnokságra** (2026. június 11. – július 19., 104 meccs) készül, hosszabb távon bármilyen sporteseményre kiterjeszthető, privát ligákkal.

A termék lényege nem a fogadás, hanem a **közösségi élmény**: a baráti rivalizálás, a ranglista-csata és a meccsnézés közös izgalma.

## 2. Célközönség

| Fázis | Célközönség | Méret |
|---|---|---|
| MVP (vb 2026) | saját baráti társaság | ~5–30 fő |
| Platform fázis | sportkedvelő baráti körök, munkahelyi közösségek | körönként 5–50 fő |
| Mobilapp fázis | szélesebb hobbi-tippelő közönség | nyílt regisztráció, privát ligák |

## 3. A játék szabályai (felhasználói szemmel)

1. Regisztrálsz, és máris tippelhetsz a vb összes hátralévő meccsére.
2. Minden meccsre **pontos eredményt** tippelsz (rendes játékidő, kieséses szakaszban is).
3. Tippelni és módosítani a **meccs kezdéséig** lehet; utána a tipp lezárul, és mindenki tippje láthatóvá válik.
4. Pontozás:
   - **3 pont** – pontos eredmény
   - **2 pont** – jó kimenetel és jó gólkülönbség (eltalált, de nem pontos döntetlen is ide tartozik)
   - **1 pont** – csak a kimenetel jó (győztes vagy döntetlen)
   - **0 pont** – rossz kimenetel
5. A pontokat az app automatikusan számolja a meccs lefújása után pár percen belül.
6. A torna végén a ranglista első helyezettje a győztes. Holtversenynél: több pontos találat, majd több eltalált kimenetel dönt.
7. Elhalasztott/törölt meccsre nem jár pont; új időpont esetén a tippelés újranyílik.

A szabályok az appban is olvashatók lesznek, hogy ne legyen vita. 🙂

## 4. Értékajánlat

- **Tippelőknek:** egy helyen az összes meccs, automatikus pontszámítás (nem kell Excel-táblát vezetni), élő ranglista, mobilon kényelmes.
- **Szervezőnek:** nulla adminisztráció — az eredmények és pontok maguktól frissülnek.

A jelenlegi tipikus alternatíva (közös Excel/üzenetváltás) pontatlan, kézi munkát igényel, és nem ad élményt; a meglévő nagy tippjátékok (pl. bukmékerek tippversenyei) pedig nem privát baráti körre vannak szabva.

## 5. Üzleti modell

**MVP és torna-fázis: teljesen ingyenes**, költsége gyakorlatilag nulla (Vercel + Supabase + football-data.org ingyenes tier).

Későbbi monetizációs irányok (csak a platform/mobilapp fázisban releváns, döntést nem igényel most):

| Modell | Leírás | Megjegyzés |
|---|---|---|
| Freemium privát liga | alap liga ingyen, extra funkciók (egyedi pontozás, több verseny, statisztikák) előfizetéssel | legvalószínűbb irány |
| Liga-szervezői díj | nagy (50+ fős) ligák után kis díj | céges közösségeknél |
| Szponzoráció/hirdetés | sportközvetítéshez kötődő hirdetők | csak nagy felhasználószámnál |

**Ami tudatosan kizárt: valódi pénzes fogadás vagy pénznyeremény kezelése az appon belül.** Ez tartja a terméket a szerencsejáték-szabályozáson kívül (lásd 7. pont).

## 6. Sikerkritériumok (vb 2026)

- Az MVP a csoportkör 1. fordulójának vége előtt élesben van.
- A baráti kör ≥80%-a regisztrál és legalább egyszer tippel.
- A regisztráltak ≥60%-a a torna második felében is aktívan tippel (megtartás).
- Nulla kézi beavatkozás az eredmények/pontok körül (a cronok megbízhatóan futnak).
- A torna végén van egyértelmű, vitathatatlan győztes.

Ezek mérése: egyszerű DB-lekérdezések (regisztrációk, tippek száma hetente), nem kell analitika-eszköz az MVP-be.

## 7. Jogi és megfelelőségi megfontolások

- **Nem szerencsejáték:** az appban nincs tét, nincs befizetés, nincs pénznyeremény — ügyességi/közösségi játék. Ha a baráti kör magánúton díjat ajánl fel a győztesnek, az az appon kívül történik, az app ebben nem vesz részt.
- **GDPR:** minimális adatkezelés (e-mail, megjelenítendő név). Kell egy rövid adatkezelési tájékoztató; fiók törlése = minden adat törlése (a séma `on delete cascade`-del ezt támogatja).
- **Adatszolgáltatói licenc:** a football-data.org ingyenes tier nem kereskedelmi használatra szól — az ingyenes baráti fázisban rendben van; monetizáció előtt fizetős adatcsomagra kell váltani.

## 8. Roadmap üzleti nézetben

| Fázis | Időtáv | Üzleti cél |
|---|---|---|
| 1. MVP | 2026. jún. 13–14. | a baráti verseny elindul a vb-n |
| 2. Torna | 2026. júl. 19-ig | élmény-finomítás, megtartás, visszajelvények gyűjtése |
| 3. Platform | 2026. ősz | több sport + privát ligák → más baráti körök bevonása |
| 4. Mobilapp | 2026/27 tél | App Store / Play megjelenés, szélesebb közönség |

A 3–4. fázis részletes üzleti tervezése (monetizáció, marketing) a vb utáni visszajelzések alapján történik — addig minden döntést a saját használat validál.

## Kapcsolódó dokumentumok

- [Fejlesztési terv](terv.md)
- [Technikai dokumentáció](technikai-dokumentacio.md)
