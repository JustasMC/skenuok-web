# Skenuok.com

Next.js 15 projektas su SEO įrankiais, AI turinio generatoriumi ir Stripe kreditų sistema.

## Quality gate prieš merge

Paleiskite lokaliai:

- `npm run lint`
- `npm run typecheck`
- `npm run test:smoke`
- `npm run build`

Important production setup:
- Set `AUTH_SECRET` or `NEXTAUTH_SECRET` in production for secure NextAuth session signing.
- Set `NEXT_PUBLIC_SITE_URL=https://your-domain.com` (required for sitemap, canonical URLs, JSON-LD).
- Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` after adding the site in Google Search Console.
- Use the matching Stripe redirect URLs for your deployed domain.
- If Google cannot crawl the site, check Railway edge rate limits (HTTP 429) — see `docs/seo-analytics-setup.md`.

Papildoma techninė dokumentacija: `docs/seo-analytics-setup.md`.
