# MeepleList

Statikus, magyar nyelvű társasjáték-ajánló [BoardGameGeek](https://boardgamegeek.com/) adatokból. GitHub Pagesen fut: a böngésző a közzétett JSON-adatkészletben szűr és rangsorol, API-token nélkül.

## Mit mutat?

- 1–12 játékoshoz top 10/20/30/50 lista, játékidő és összetettség szerinti szűrővel.
- BGG-rang, átlagos értékelés, játékosszám, játékidő, összetettség, értékelésszám és a pontos létszámra leadott ajánlási szavazatok.
- A sorrend a BGG Bayes-átlag és az adott létszámhoz tartozó szavazatok súlyozott összegéből készül. Ez a MeepleList ajánlási sorrendje, nem a BGG hivatalos rangsora.
- A katalógus 200 előre kiválasztott, magasra rangsorolt jelöltből áll. Nagyobb létszámra kevesebb találat lehet.

## Helyi futtatás

Node.js 20 vagy újabb szükséges:

```sh
npm ci
npm test
npm run build
```

A `dist/` könyvtár a kész statikus oldal. Helyi megnyitáshoz futtasd az `npm run preview` parancsot, majd nyisd meg a `http://127.0.0.1:4173/meeplelist/` címet. Az előnézet a GitHub Pages alkönyvtáras útvonalát is modellezi.

## GitHub Pages

A `.github/workflows/pages.yml` workflow a `main` ágra érkező push után publikálja az oldalt. Az új repositoryban először a **Settings → Pages → Build and deployment → Source** értékét állítsd **GitHub Actions**-ra. Ezután az **Actions → Publish MeepleList** oldalon indítsd újra a korábbi sikertelen futást, vagy használd a **Run workflow** gombot. A várható cím: `https://tomiacs.github.io/meeplelist/`.

A repó tartalmaz egy 2026. szeptember 25-én, élő BGG API-lekérdezéssel frissített adatpillanatképet, így token nélkül is megjelenik a lista. A frissítéshez hozz létre egy `BGG_API_TOKEN` nevű **repository secretet** a **Settings → Secrets and variables → Actions** oldalon. A workflow ekkor pushkor és hétfőnként újra lekéri a 200 jelölt adatait a BGG XML API2-ből. A token csak az Actions futás környezeti változójaként szerepel, a közzétett fájlokba és a böngészőbe nem kerül be.

A frissítés helyben is futtatható, ha a `BGG_API_TOKEN` környezeti változót beállítod:

```sh
npm run update:data
npm run build
```

Windows alatt a korábban elmentett DPAPI-titokkal a `./scripts/update-data-local.ps1` parancs használható. A PowerShell csak a kulcsot olvassa fel; a BGG API lekérdezéseit a Node-szkript végzi.

Az adatkészlethez kezdetben felhasznált régi gyorsítótárból az induló JSON a `npm run seed:cache -- <cache-fájl-útvonal>` paranccsal állítható elő. Ez a parancs kizárólag a publikus játékadatokat másolja át.

## Adatforrás

Az adatok forrása a [BoardGameGeek XML API2](https://boardgamegeek.com/wiki/page/BGG_XML_API2). A publikus felületen megjelenik a BoardGameGeekre hivatkozó „Powered by BGG” logó. Az alkalmazás nem kereskedelmi felhasználásra készült; az API használatára a [BGG feltételei](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use) vonatkoznak.
