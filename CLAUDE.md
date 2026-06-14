# byronjones — Portfolio Site

Personal portfolio site for Byron Jones. Showcases instrumentation & automation projects (primarily OpenPLC / ladder logic) to support a career transition from software development into controls / instrumentation work, with interest in mining.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** for components
- **Framer Motion** for subtle motion (scroll reveals, hover, parallax)
- **MDX** for project pages — each project is one `.mdx` file with frontmatter
- **Vercel** for hosting (Hobby plan, free) — auto-deploy on push to `main`
- **No separate backend.** Next.js API routes cover the contact form. If/when a CMS or dynamic data is needed, revisit.

## Site structure

- `/` — Homepage: name, tagline "Instrumentation & Automation Projects", short intro, link into projects
- `/about` — Education (instrumentation + software background), interest in mining/automation, career goal (controls / instrumentation tech)
- `/projects` — Index of all projects (cards with title, short problem statement, skills tags)
- `/projects/[slug]` — Individual project page rendered from MDX
- Bonus (optional): GitHub link, resume PDF download (`/public/resume.pdf`), contact (form via Resend/Formspree, or `mailto:`)

## Project page template (per project MDX)

Each project MDX has frontmatter and these sections:

1. **Title** — e.g., "Motor Start/Stop Control System (Ladder Logic)"
2. **Problem description** — what real-world scenario the logic simulates
3. **Logic explanation** — seal-in circuit, E-stop behavior, interlocks, etc.
4. **Visuals** — ladder logic screenshot (OpenPLC editor), system diagram (SVG), optional short video
5. **Skills used** — Ladder logic (IEC 61131-3), PLC simulation, industrial control logic, etc.

## OpenPLC project display strategy

Static screenshots from the OpenPLC editor + SVG system diagrams are the baseline. Video demos (30–90 sec showing the simulator running — toggling inputs, watching outputs respond, E-stop dropping the coil) are the highest-impact addition and recommended for at least the strongest project. Host videos on YouTube unlisted or Loom (both free) and embed in MDX.

Ship without videos first. Don't let video recording block launch.

## Cost

- $0 to launch. Vercel Hobby + GitHub + all libraries are free.
- ~$12/year if a custom domain is wanted later (Namecheap/Cloudflare). `*.vercel.app` URL is fine for v1.

## Setup steps

**User does (prereqs):**
1. Install Node.js LTS (v20+) and Git
2. Create GitHub account
3. Create Vercel account → "Continue with GitHub" (links them for auto-deploy)

**Claude does (scaffold):**
4. `npx create-next-app@latest` in `byronjones/` with TS + Tailwind + App Router
5. Add shadcn/ui, Framer Motion, MDX support
6. Build initial page structure (Home, About, Projects index, project route, layout/nav)
7. Set up first project MDX as a template

**User does (deploy):**
8. Create empty GitHub repo `portfolio` (or similar). Do NOT initialize with README.
9. Run the three git commands Claude provides to push.
10. Go to https://vercel.com/new → import the repo → click Deploy. ~60 sec to live URL.
11. (Optional) Add custom domain under Vercel project → Settings → Domains.

## Personal info (from Byron's brief)

- **Name:** Byron Jones
- **Email:** byronjones77@gmail.com
- **Location:** Carleton Place, Ontario, Canada
- **GitHub:** https://github.com/jyronbones
- **LinkedIn:** https://linkedin.com/in/byron-jones89

## Homepage content (from Byron's brief)

- **Name display:** Byron Jones
- **Subtitle:** Instrumentation & Automation | Controls & PLC Programming
- **Tagline (intro paragraph):**
  > Automation and instrumentation student with a Computer Engineering Technology background and three years of professional technical experience. Comfortable with control logic, troubleshooting, and reading schematics. Seeking an automation and instrumentation co-op.

Background note: Byron is a student in automation/instrumentation with a Computer Engineering Technology background and 3 years of professional technical experience. Currently seeking a co-op placement.

## Decisions

### Domain
`byronjones.vercel.app` — no custom domain for v1. Can be added later via Vercel project Settings → Domains.

### Aesthetic — "Refined industrial-modern"
Tone goal (Byron's words): **"Industrial, not school assignment vibes. Slick, elegant, professional, drawing attention."**

- **Palette:** Deep charcoal background (`#0B0D0F` or similar near-black, NOT pure `#000`). Off-white text (`#E8E8E8`). Single accent: **electric amber** (`#FFB020` / industrial signaling color used in real control panels for caution/active states). Avoid generic blue/cyan/purple — overused in dev portfolios.
- **Texture:** Very faint blueprint-style grid as a background layer (low opacity, ~3–5%). Subtle, not loud.
- **Typography:**
  - Body / headings: **Inter** or **Geist** (clean modern sans-serif)
  - Technical labels, code, signal names, skill tags: **JetBrains Mono** or **Geist Mono**
- **Motion (Framer Motion):**
  - Scroll-reveal fades / slight translate-up on section entry
  - Hover lift + amber edge highlight on project cards
  - Small pulsing amber dot for "Available for co-op" status indicator in hero
- **Components:** shadcn/ui base, restyled to match. Cards with subtle border, slight inner glow on hover. Skill tags as monospace pills with thin border.
- **No:** glassmorphism overload, gradient text, AI-generated hero images, hero video backgrounds, parallax scroll on the entire page, particle effects.

### Projects to feature

**1. Motor Start/Stop + Seal-in Circuit** (must-have, lead project)
- Build with: OpenPLC (preferred — free/open, already in Byron's toolchain) or Schneider Machine Expert
- Logic: Start button, Stop button, motor seal-in (latching), E-stop
- Pitch: "30–40% of real mine equipment logic." Demonstrates fundamental industrial control.

**2. Tank Level Control System** (process control showcase — important for mining audience)
- Logic: 2–3 level sensors (low/high/overflow), pump control, alarm conditions
- Features: auto + manual mode switch, overflow alarm light
- Pitch: "Mines run on slurry tanks, water systems, and process control loops."

**3. Conveyor System Simulation** (bonus — sequencing & process flow)
- Logic: start sequence, material-detect sensor, stop/start delay, fault handling
- Pitch: Demonstrates sequencing and industrial process flow.

### Per-project documentation requirements (Byron's spec)

- Ladder logic screenshot (from OpenPLC editor)
- Short written explanation of what it does
- Wiring diagram (hand-drawn is acceptable for v1)
- Link to GitHub repo with the project files (`.st` / `.xml` / project export)
- Optional: short video of the simulator running (highest impact — see strategy section)

## Open questions (still need from Byron)

1. **About page details** — need the specifics to write a strong About page:
   - School name + program name (Computer Engineering Technology — which school?)
   - Current automation/instrumentation program (school + program name)
   - The "three years of professional technical experience" — what kind of work? (roles, industries, key skills) Even bullet points are fine.
   - Mining interest — why mining specifically? Any prior exposure (family, region, visits, courses)?
2. **Resume PDF** — drop into `/public/resume.pdf` when ready. Can ship v1 without it.
3. **Profile photo / avatar** — optional. Headshot in hero, or skip and let typography carry it?

## Notes

- Folder was renamed from `I-C` to `byronjones`. Only `LICENSE` exists in it currently.
- Scaffold should target this folder as the project root.
- Memory consent: confirmed — Byron's background is persisted in Claude memory.
