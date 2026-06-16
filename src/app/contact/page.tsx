import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { Section, SectionLabel } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { StatusDot } from "@/components/status-dot";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Byron Jones — open to automation & instrumentation co-op opportunities.",
};

const links = [
  {
    label: "LinkedIn",
    value: "linkedin.com/in/byron-jones89",
    href: site.linkedin,
    Icon: LinkedinIcon,
  },
  {
    label: "GitHub",
    value: "github.com/jyronbones",
    href: site.github,
    Icon: GithubIcon,
  },
];

export default function ContactPage() {
  return (
    <Section className="max-w-3xl pt-16 md:pt-20">
      <ScrollReveal>
        {site.availableForCoop && (
          <div className="mb-6">
            <StatusDot />
          </div>
        )}
        <SectionLabel>Contact</SectionLabel>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Get in touch
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          I&apos;m seeking an automation &amp; instrumentation co-op placement and
          happy to talk about controls, PLC work, or opportunities. Send a message
          below and it comes straight to my inbox.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.08}>
        <div className="mt-10">
          <ContactForm />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.12}>
        <div className="mt-12">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Or find me on
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {links.map(({ label, value, href, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-1 items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-amber/50"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/50 text-muted-foreground transition-colors group-hover:text-amber">
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-xs uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="block truncate text-foreground">{value}</span>
                </span>
                <ArrowUpRight className="ml-auto size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-amber" />
              </Link>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
