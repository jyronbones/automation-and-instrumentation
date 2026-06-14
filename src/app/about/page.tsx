import type { Metadata } from "next";
import { FileText, Download, MapPin } from "lucide-react";
import { Section, SectionLabel } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SkillPill } from "@/components/skill-pill";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Automation & instrumentation student with a Computer Engineering Technology background, seeking a co-op in controls / instrumentation.",
};

const skills = [
  "Ladder Logic (IEC 61131-3)",
  "PLC Programming",
  "OpenPLC",
  "Control Logic",
  "Seal-in / Latching",
  "E-Stop & Interlocks",
  "Process Control",
  "Reading Schematics",
  "Troubleshooting",
  "Instrumentation",
];

export default function AboutPage() {
  return (
    <Section className="max-w-3xl pt-16 md:pt-20">
      <ScrollReveal>
        <SectionLabel>About</SectionLabel>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {site.name}
        </h1>
        <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {site.location}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
          <p>{site.tagline}</p>
          <p>
            My path into controls runs through software: a Computer Engineering
            Technology background plus three years of professional technical
            experience gave me a solid foundation in logic, debugging, and
            systems thinking. I&apos;m now focused on applying that to industrial
            automation and instrumentation — building and simulating real control
            logic, not just reading about it.
          </p>
        </div>
      </ScrollReveal>

      {/* TODO (Byron): fill in school + program names and the specifics of your
          three years of experience. Placeholder copy below until then. */}
      <ScrollReveal delay={0.1}>
        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Background</h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground">Education —</span> Automation &
              Instrumentation program{" "}
              <span className="font-mono text-sm text-muted-foreground/70">
                [school / program name]
              </span>
              , building on a Computer Engineering Technology diploma{" "}
              <span className="font-mono text-sm text-muted-foreground/70">
                [school name]
              </span>
              .
            </li>
            <li>
              <span className="text-foreground">Experience —</span> Three years of
              professional technical work{" "}
              <span className="font-mono text-sm text-muted-foreground/70">
                [roles / industries / key skills]
              </span>
              .
            </li>
            <li>
              <span className="text-foreground">Industry interest —</span> Mining
              and heavy-industry automation, where reliable control logic and
              instrumentation keep critical equipment running safely.
            </li>
          </ul>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <SkillPill key={skill}>{skill}</SkillPill>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="mt-12 rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Résumé</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The full breakdown of my education, experience, and skills.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              <FileText className="size-4" />
              View résumé
            </a>
            <a
              href="/resume.pdf"
              download
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <Download className="size-4" />
              Download
            </a>
          </div>
        </div>
      </ScrollReveal>
    </Section>
  );
}
