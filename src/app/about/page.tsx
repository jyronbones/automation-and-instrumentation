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

const skillGroups = [
  {
    label: "Automation & controls",
    skills: [
      "Ladder Logic (IEC 61131-3)",
      "PLC Programming",
      "Allen-Bradley RSLogix / Studio 5000",
      "OpenPLC",
      "Control Systems",
      "Sensor & I/O Interfacing",
      "Seal-in / Latching",
      "E-Stop & Interlocks",
    ],
  },
  {
    label: "Electrical & electronics",
    skills: [
      "Circuits & Wiring",
      "Microcontrollers",
      "Reading Schematics",
      "Technical Drawings",
    ],
  },
  {
    label: "Troubleshooting & software",
    skills: [
      "Methodical Fault-Finding",
      "Hardware / Software Diagnostics",
      "Python",
      "C / C++",
      "SQL",
    ],
  },
  {
    label: "Licenses & safety",
    skills: ["WHMIS", "Forklift-Trained", "Class G Licence"],
  },
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
            automation and instrumentation.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">Background</h2>
          <ul className="mt-4 space-y-3 text-base leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground">Education</span>
              <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-amber/60">
                <li>
                  <span className="text-foreground">
                    Diploma, Automation &amp; Instrumentation Technician
                  </span>
                  , St. Lawrence College
                  <span className="ml-2 rounded border border-amber/30 bg-amber/5 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-amber">
                    in progress
                  </span>
                </li>
                <li>
                  <span className="text-foreground">
                    Advanced Diploma, Computer Engineering Technology - Computing Science
                  </span>
                  , Algonquin College
                </li>
                <li>
                  <span className="text-foreground">
                    Bachelor of Science, Biology &amp; Psychology
                  </span>
                  , University of Ottawa
                </li>
              </ul>
            </li>
            <li>
              <span className="text-foreground">Experience</span>
              <ul className="mt-3 list-disc space-y-2.5 pl-5 marker:text-amber/60">
                <li>
                  <span className="text-foreground">Software Developer</span>,
                  Warner Bros. Discovery (2023). Diagnosed and resolved critical
                  production issues across systems and device tiers with methodical
                  troubleshooting, and built automated checks that raised test
                  coverage by 70%.
                </li>
                <li>
                  <span className="text-foreground">Data Engineer</span>, Lytica
                  (2022–2023). Built Python tools that automated manual data
                  processes end to end, and tuned SQL performance for reliability
                  and throughput.
                </li>
                <li>
                  <span className="text-foreground">
                    Customer Service Representative
                  </span>
                  , LCBO (2007–2020). 13 years of dependable service, frequently
                  acting as manager and training staff; forklift-trained with a
                  strong safety-and-procedure focus.
                </li>
              </ul>
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
          <div className="mt-5 space-y-5">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-amber">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <SkillPill key={skill}>{skill}</SkillPill>
                  ))}
                </div>
              </div>
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
