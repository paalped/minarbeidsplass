# Min Arbeidsplass

Nettsted der folk kan sladre om jobben, ta en utfyllende arbeidsplassundersøkelse og følge kåringen av Norges beste arbeidsplass. Firmasøk går mot Brønnøysundregistrene (Enhetsregisteret).

Stack: Next.js (App Router) på Vercel, Supabase (Postgres, Auth, Realtime).

## Oppsett

### 1. Installer

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

1. Opprett et prosjekt på [supabase.com](https://supabase.com).
2. Kopier **Project URL** og **anon public**-nøkkelen til `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Kjør SQL-filen [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) i **SQL Editor**. Den lager tabeller, RLS, ranking-view, Realtime på chat, undersøkelsen og seed for nyheter + tre demobedrifter i kåringen.
4. Under **Authentication → URL configuration**:
   - Site URL: `http://localhost:3000` (og senere produksjonsdomenet)
   - Redirect URLs: `http://localhost:3000/auth/callback` og `https://ditt-domene.no/auth/callback`

E-postinnlogging (magic link) er på som standard.

### 3. Kjør lokalt

```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000). Firmasøk mot Brreg virker også uten Supabase. Kåring, nyheter, sladder, chat og undersøkelse krever nøkler og migrasjonen.

## Vercel

Koble repoet til Vercel og sett de samme miljøvariablene. Sett `NEXT_PUBLIC_SITE_URL` til produksjons-URL, og legg den inn som Site URL i Supabase Auth.

## Hva som er med

- Landing med firmasøk, siste kåring og nyheter
- Bedriftssider med Brreg-data, score og anonym sladder
- Manuell bedrift hvis søket ikke treffer
- Innlogget undersøkelse (23 spørsmål, syv kategorier)
- Kåringsside: Norges beste arbeidsplass (minst tre svar)
- Nyheter
- Globalt sladderrom (Realtime, innlogging)

## Utenfor denne versjonen

Moderering, per-bedrift-chat, verifisert ansettelse og arbeidsgiver-svar.
