// Central place for Byron's personal info and site-wide copy.

export const site = {
  name: "Byron Jones",
  subtitle: "Industrial Automation | Controls & PLC Programming",
  tagline:
    "PLC and control logic projects, built and simulated in OpenPLC.",
  location: "Carleton Place, Ontario, Canada",
  github: "https://github.com/jyronbones",
  linkedin: "https://linkedin.com/in/byron-jones89",
  url: "https://byronjones-ia.vercel.app",
  // Main personal site; About and Contact live there.
  mainSite: "https://byronjones.vercel.app",
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
] as const;
