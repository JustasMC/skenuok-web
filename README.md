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
- Use the matching `NEXT_PUBLIC_SITE_URL` and Stripe redirect URLs for your deployed domain.

Papildoma techninė dokumentacija: `docs/seo-analytics-setup.md`.
