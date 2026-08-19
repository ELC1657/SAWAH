# SAWAH

SAWAH records languages that were never written down. It starts with Sasak.

**[sawah.world](https://sawah.world)**

Around three million people speak Sasak, the language of Lombok, Indonesia.
Almost none of it has ever been written down. Indonesian is the language of
school, work and the internet there, and each generation carries a little less
of the vocabulary that exists nowhere but in speech.

Every word is recorded with the dialect it came from and translated into both
English and Indonesian, so it reaches a learner abroad and a speaker at home.
Five dialects, no standard spelling, and a verification mark on the entries an
editor has checked.

Sasak is the first language on the map, not the only one intended for it. The
schema has handled multiple dictionaries since its first migration.

---

## What it does

- **Trilingual entries.** A Sasak headword with English and Indonesian
  translations, both required, plus example sentences and usage notes.
- **Five dialects, five colours.** Kuto-Kute, Ngeto-Ngete, Ngeno-Ngene,
  Meno-Mene and Meriaq-Meriku. Each owns a colour that follows its words
  everywhere they appear.
- **A zoomable map.** Indonesia at a glance, Lombok up close, then a single
  dialect area filling the frame. Clicking a region filters the dictionary and
  puts the selection in the URL.
- **Search across three languages at once.** Full text plus trigram fuzzy
  matching, because the same Sasak word gets typed four different ways.
- **Passwordless accounts.** Email link sign-in, with contributions credited to
  an anonymous handle rather than an address.
- **Publish on submit.** A word is public the moment it is added. Entries an
  editor has verified carry a seal; unverified ones are shown plainly without
  one.
- **Moderation.** A review queue and a reports screen, with vote-based
  verification as a second path.

See the [roadmap](https://sawah.world/roadmap) for what is shipped, in build and
planned.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16, App Router, React 19, TypeScript |
| Styling | Tailwind v4, CSS-first tokens |
| Motion | Motion (Framer) |
| Database | Postgres via Supabase |
| Auth | Supabase Auth, magic link, custom SMTP |
| Hosting | Netlify |

No map library. The atlas is generated geometry inlined as SVG paths, so there
are no tile requests and nothing to load at runtime.

---

## How it is put together

**Multi-dictionary from the first migration.** Entries store `term` and `gloss`,
never `sasak` and `english`. The language pair is a row in `dictionaries`, and
regions belong to a dictionary. Adding a language is an insert plus geometry,
not a schema change.

**Rules live in the database.** Rate limits, the insert guard that forces every
submission to `pending`, duplicate detection, vote promotion and the editor
distinction are all triggers and policies. Hitting the REST API directly
bypasses none of it.

**The seal cannot be faked.** `entries.editor_checked` is a generated column,
`status = 'verified' AND reviewed_by IS NOT NULL`. Only a human moderator
decision writes `reviewed_by`; the vote trigger deliberately leaves it null. So
the two routes to verification stay distinguishable and cannot drift apart.

**The map is real geography.** Indonesia comes from Natural Earth, Lombok's
coastline and regency outlines from OpenStreetMap, intersected with Shapely so
every dialect area is clipped to actual land. Indonesia and Lombok share one
coordinate space, which is what makes the zoom a continuous camera move rather
than a cross-fade. The two internal dialect boundaries are approximate, and the
map says so, because OSM has no sub-district geometry for Lombok.

---

## Running it locally

Requires Node 20+, Docker Desktop, and the Supabase CLI (via `npx`).

```bash
git clone https://github.com/ELC1657/SAWAH.git
cd SAWAH
npm install

# Postgres, auth and a mail catcher, all local
npx supabase start

cp .env.local.example .env.local
# fill in the API URL and anon key that `supabase start` printed

npm run dev
```

- App: http://localhost:3000
- Sign-in emails: http://localhost:54324 (nothing leaves your machine)
- Studio: http://localhost:54323

Migrations in `supabase/migrations` apply automatically on `supabase start` and
on `npx supabase db reset`.

To give yourself admin and load starter entries, sign in once, then:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

```bash
docker exec -i supabase_db_sawah psql -U postgres -d postgres \
  -f - < supabase/starter_entries.sql
```

---

## Layout

```
app/            routes: dictionary, entry, submit, contributions, admin, roadmap
components/     ui, entry, search, map, admin, roadmap
lib/
  actions/      server actions: entries, votes, flags, moderation, auth
  map/atlas.ts  generated geometry, do not hand edit
  supabase/     browser, server and session clients
supabase/
  migrations/   schema, triggers, RLS, grants, search
```

---

## Contributing

Pull requests are welcome, particularly:

- Corrections to dialect attributions. These are the least certain thing here.
- Accessibility fixes.
- Anything on the roadmap marked "In build".

Please open an issue before starting something large.

Contributions are accepted under [LICENSE](LICENSE) section A4: you keep your
copyright and grant the right to ship it. Whether a pull request is accepted is
the maintainer's call.

Words you submit through the site are released under CC BY 4.0, as described in
Part B.

---

## Licence

This project has two halves, licensed differently on purpose. See
[LICENSE](LICENSE).

### The code: open to read, closed to use

You may read it, study it, quote it, and fork it to prepare a pull request.

You may not deploy it, redistribute it, keep a modified version, use any part of
it to build another product or website, or make money from it. Reading it is
free. Running it for anyone but yourself is not.

### The dictionary: open to everyone

Every word, translation, example and usage note is released under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

Copy it, publish it, translate it, print it, train on it, or sell something made
from it. No permission needed. The only condition is credit to SAWAH.

A language does not belong to whoever built the website that recorded it. It
belongs to the people who speak it. Licensing Sasak words as tightly as the
software would make this project a worse version of the problem it exists to
fix.

---

Map data: Natural Earth (public domain) and OpenStreetMap contributors (ODbL).
