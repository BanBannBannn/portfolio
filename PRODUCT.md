# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

No single primary persona. The owner confirmed the page is opened by several
different kinds of reader, and declined to rank one above the others:

- **Non-technical recruiters and HR screeners**, arriving from a CV link or
  LinkedIn, scanning for perhaps half a minute to decide whether to pass the
  candidate to an engineering team. They need role, stack, availability and a
  contact route without reading prose.
- **Hiring engineers and tech leads**, reading properly and following links out
  to GitHub repos and live demos. They judge the quality of technical decisions,
  not the length of a technology list.
- **People the owner sends the link to directly** — acquaintances, contacts,
  conversations already in progress — who arrive with context the page does not
  have to establish.

Design consequence (derived, not a fourth audience): the page has to survive the
shallowest possible scan while still rewarding the deepest read. Splitting into
persona-specific paths is not available, because the owner did not accept a
primary reader.

## Product Purpose

A personal portfolio for **Trần Văn Gia Bân**, a backend-leaning software
engineer in Thủ Đức, Ho Chi Minh City. It exists to convert a cold link into an
interview conversation. Success is an email or a message arriving from someone
who read the page — not traffic, not time on page.

The site is currently in active job-search service: the owner is applying to
Vietnamese companies and to remote/overseas positions **in parallel**, with
neither track deprioritised. Copy therefore cannot assume a Vietnamese reader,
and cannot assume an international one either.

## Positioning

Backend engineer whose evidence is deployed and inspectable rather than
described. Every project on the page links to real source, and most link to a
running deployment. The differentiator a neighbouring portfolio could not
truthfully copy is the specific combination the work history actually contains:
polyglot backend delivery (ASP.NET Core, Spring Boot, FastAPI, NestJS) alongside
production retrieval-augmented-generation work with Qdrant and agent logic in
Python — plus a stated habit of choosing the datastore to fit the problem
(PostgreSQL and SQL Server for shaped data, MongoDB for unshaped, Qdrant for
semantic search) rather than to pad a résumé.

## Operating Context

- The page is nearly always reached from somewhere else: a CV PDF, a LinkedIn
  profile, or a link pasted into a message. It is not discovered by search and
  should not be planned as if it were.
- Recruiter reads frequently happen on a phone, in a queue of many candidate
  links, with no patience budget.
- Engineer reads happen on a desktop, usually with GitHub open in another tab.
  Outbound links to source and demos are part of the evaluation, not decoration.
- The reader may already be holding the CV PDF while reading the page, so
  visible contradictions between the two are costly.

## Capabilities and Constraints

Current technical reality, read from the codebase (recorded as fact, **not**
confirmed by the owner as permanently binding):

- Next.js 16 App Router with React 19 and TypeScript; `next dev --webpack`.
- Deployed on Vercel with a server runtime (static export was dropped in
  Nov 2026 for the chat). Pages are still prerendered as static HTML; the one
  server route is `POST /api/chat`, an AI assistant that answers only from
  `content/profile.md` (Claude Haiku 5.5). See `docs/chat-setup.md`.
- Installable PWA with an offline service worker via Serwist (`app/sw.ts` →
  `public/sw.js`), plus `public/manifest.json`.
- A single scrolling route (`app/page.tsx`) composed of six sections: Hero,
  About, Skills, Work, Projects, Contact, with a persistent Nav and Footer.
- Content lives in typed arrays inside the section components, not in a CMS or
  content collection. Editing content means editing TSX.
- Copy is English-only. No Vietnamese version exists.

Explicitly undecided — do not treat these as settled:

- Whether the single-page structure, the static/PWA setup, and English-only are
  permanent commitments. The owner did not confirm any of them as binding when
  asked directly.

Open factual item that future work must resolve rather than paper over:

- `app/components/Hero.tsx` claims "Two years of it", while
  `app/components/Experience.tsx` lists Jan–Apr 2024 (FPT Software internship)
  and Sep 2025–Apr 2026 (HANEXT Technology) — roughly one year seven months
  including the internship. A reader holding the CV can see the gap. The number
  must be corrected by the owner, not silently rewritten or dropped.

## Brand Commitments

- Real name in full, with Vietnamese diacritics: **Trần Văn Gia Bân**.
- Voice is first-person, plain, specific and unembellished. It names real
  systems and real decisions and avoids industry filler. This is a deliberate,
  owner-driven position: the portfolio was rewritten specifically because an
  earlier version read as generic and machine-written.
- The following were removed on purpose and must not return: aurora/blob
  backgrounds, glassmorphism, gradient text, cursor glow, magnetic buttons,
  spotlight hover, 3D tilt, scroll-progress bars, multi-colour theme switchers,
  emoji used as icons, fake terminal or API cards, "01 / About" section
  numbering, invented statistics, and slogan copy of the
  "crafting software that scales" variety.

## Evidence on Hand

Real, present in the repository:

- `public/cv-TranVanGiaBan.pdf` — a genuine CV. **Important qualification from
  the owner: it is accurate today, but may fall out of date because the owner
  will not necessarily refresh it.** The page is therefore the maintained
  surface and the PDF is a snapshot that can drift. Do not build anything that
  depends on the PDF staying current, and do not resolve future conflicts in the
  PDF's favour.
- `public/portrait.jpg` — a real photograph of the owner.
- Real contact routes: tranvangiaban@gmail.com, +84 967 174 978,
  github.com/BanBannBannn, linkedin.com/in/bantrandev.
- Six projects with real repositories; GameHub, SmartMenuVibe and DevToolBox AI
  additionally have live deployments on Vercel.
- Two real positions: HANEXT Technology (Sep 2025 – Apr 2026, Software
  Engineer) and FPT Software (Jan – Apr 2024, Software Engineer Intern).
- A university capstone, WareEase, a warehouse inventory API with role-based
  access control and a CI/CD pipeline.

Absent — must never be fabricated:

- No testimonials, references, or quotes from colleagues or managers.
- No performance numbers, uptime figures, scale metrics, user counts, or
  benchmark results.
- No awards, certifications, publications, or press.
- No client names beyond the two employers already listed; HANEXT client
  projects are described generically because they are not the owner's to name.
- No screenshots or product imagery for any project; the only photograph on the
  site is the portrait.

## Product Principles

1. **Survive the scan, reward the read.** With no primary persona available,
   every section must deliver its point to someone who reads only its first
   line, and hold something further for someone who reads all of it.
2. **Evidence over adjectives.** A claim earns its place by linking to source,
   to a deployment, or to a named system. Anything that cannot be checked should
   be cut rather than softened.
3. **Specific beats impressive.** The voice was rebuilt to sound like a real
   engineer, and specificity is what protects it. Concrete tools, concrete
   decisions, concrete tradeoffs — never a superlative standing in for one.
4. **Two markets, one page.** Vietnamese and remote/international applications
   run in parallel, so nothing may assume local context or local reputation, and
   nothing may perform for an overseas audience at the expense of a local one.
5. **The page outranks the PDF.** Content on the site is the maintained truth.
   Duplicating facts that will drift is a liability, not thoroughness.

## Accessibility & Inclusion

No product-specific standard was established by the owner. The general
obligation stands: a recruiter scanning on a phone is a core usage scene, so
mobile legibility, tap-target size, and text contrast are functional
requirements rather than compliance chores.
