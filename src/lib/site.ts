// Central place for Byron's personal info and site-wide copy.

export const site = {
  name: "Byron Jones",
  subtitle: "Instrumentation & Automation | Controls & PLC Programming",
  tagline:
    "Automation and instrumentation student with a Computer Engineering Technology background and three years of professional technical experience. Comfortable with control logic, troubleshooting, and reading schematics. Seeking an automation and instrumentation co-op.",
  location: "Carleton Place, Ontario, Canada",
  email: "byronjones77@gmail.com",
  github: "https://github.com/jyronbones",
  linkedin: "https://linkedin.com/in/byron-jones89",
  url: "https://byronjones.vercel.app",
  availableForCoop: true,
  // Contact form posts here via AJAX; Formspree forwards to your inbox. The
  // visitor never sees Formspree — just the form and the success message.
  formspreeEndpoint: "https://formspree.io/f/mqeowjvq",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
