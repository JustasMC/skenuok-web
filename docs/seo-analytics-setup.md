# SEO ir analitikos setup

## Kodėl Google neranda puslapio (checklist)

### 1. Railway „rate limited“ (429) — dažniausia priežastis

Jei `curl -I https://skenuok.com/robots.txt` grąžina **HTTP 429** ir `rate limited`, Googlebot negali nuskaityti svetainės — indeksavimas sustoja.

**Ką daryti:**

1. Railway → projektas → **Settings** → patikrinkite DDoS / edge apsaugą (jei įjungta — sumažinkite agresyvumą arba leiskite žinomus botus).
2. Įsitikinkite, kad domenas nėra per dažnai skenuojamas (PSI, Lighthouse, uptime monitoriai gali sukelti limitą).
3. Jei problema kartojasi — apsvarstykite **Cloudflare** prieš Railway (įjunkite „Verified Bots“ / leiskite Googlebot).
4. Po pataisymo **Google Search Console** → URL Inspection → „Request indexing“ pagrindiniam URL.

### 2. Kanoninis domenas build / runtime metu

`NEXT_PUBLIC_SITE_URL` turi būti **`https://skenuok.com`** (be galo `/`):

- Railway **Variables** — nustatyti prieš deploy.
- Dockerfile build gauna šį kintamąjį per `ARG` — po pakeitimo būtinas **naujas deploy**.

Jei kintamasis tuščias, sitemap / canonical / JSON-LD gali rodyti `http://localhost:3000` — Google indeksuoja neteisingą adresą.

**Patikra po deploy:**

```bash
curl -s https://skenuok.com/sitemap.xml | head -5
curl -s https://skenuok.com/robots.txt
```

Turėtumėte matyti `https://skenuok.com/...`, ne `localhost`.

### 3. Google Search Console (GSC)

1. Eikite į [Google Search Console](https://search.google.com/search-console).
2. Pridėkite nuosavybę: `https://skenuok.com` (domain arba URL prefix).
3. Patvirtinimas per HTML meta žymę:
   - GSC → HTML tag → nukopijuokite `content` reikšmę.
   - Railway: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<tik code>` → redeploy.
4. **Sitemaps** → pridėkite: `https://skenuok.com/sitemap.xml`.
5. **URL Inspection** → pagrindinis puslapis → Request indexing.

Indeksavimas po naujo puslapio gali užtrukti **kelias dienas–savaites** — tai normalu.

### 4. www → be www

`next.config.ts` nukreipia `www.skenuok.com` → `https://skenuok.com`. DNS turėtų turėti tik vieną kanoninį variantą.

---

## Analitika (Google Analytics 4)

- GA įdėta į `src/app/layout.tsx` (lazy `gtag`).
- Nustatykite `NEXT_PUBLIC_GA_ID` (pvz. `G-XXXXXXXXXX`) Railway kintamuosiuose.

## SEO bazė (kode)

| Failas | Paskirtis |
|--------|-----------|
| `src/app/layout.tsx` | Global `generateMetadata`, JSON-LD |
| `src/app/robots.ts` | `robots.txt` (dinaminis) |
| `src/app/sitemap.ts` | `sitemap.xml` (dinaminis) |
| `src/lib/site-url.ts` | Kanoninis domenas, OG paveikslėlis |
| `src/app/opengraph-image.tsx` | OG paveikslėlis (vietoje `/og-image.png`) |

## Kokybės vartai prieš deploy

```bash
npm run lint
npm run typecheck
npm run test:smoke
npm run build
```
