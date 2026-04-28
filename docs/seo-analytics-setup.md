# SEO ir analitikos setup

## Analitika (Google Analytics 4)
- Komponentas įdėtas į `src/app/layout.tsx` naudojant `@next/third-parties/google`.
- Naudojamas Measurement ID: `G-J29QGBZ1MT`.
- Jei norite valdyti per env, naudokite `NEXT_PUBLIC_GA_ID` iš `.env`.

## SEO bazė
- Global metadata ir JSON-LD: `src/app/layout.tsx`.
- Robots taisyklės: `src/app/robots.ts`.
- Sitemap generavimas: `src/app/sitemap.ts`.
- Puslapių metadata: `generateMetadata` arba `metadata` atitinkamuose route failuose.

## Kokybės vartai prieš deploy
- `npm run lint`
- `npm run typecheck`
- `npm run test:smoke`
- `npm run build`
