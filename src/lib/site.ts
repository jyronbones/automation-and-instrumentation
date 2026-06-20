// Central place for Byron's personal info and site-wide copy.

export const site = {
  name: "Byron Jones",
  subtitle: "Industrial Automation | Controls & PLC Programming",
  tagline:
    "Industrial automation and controls projects — PLC programming, control logic, and process instrumentation, built and simulated in OpenPLC. Backed by a Computer Engineering Technology background and three years of professional technical experience.",
  location: "Carleton Place, Ontario, Canada",
  github: "https://github.com/jyronbones",
  linkedin: "https://linkedin.com/in/byron-jones89",
  url: "https://byronjones-ia.vercel.app",
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
