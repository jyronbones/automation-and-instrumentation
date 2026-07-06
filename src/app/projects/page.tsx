import type { Metadata } from "next";
import { Section, SectionLabel } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProjectCard } from "@/components/project-card";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Industrial control logic projects: ladder logic, PLC simulation, and process control.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <Section className="pt-16 md:pt-20">
      <ScrollReveal>
        <SectionLabel>Projects</SectionLabel>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Automation & Control Logic
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Control logic, process control, and sequencing projects built and
          simulated in OpenPLC. Each one documents the logic, wiring, and skills
          involved.
        </p>
      </ScrollReveal>

      {projects.length === 0 ? (
        <p className="mt-12 font-mono text-sm text-muted-foreground">
          Projects coming soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <ScrollReveal key={project.meta.slug} delay={i * 0.06}>
              <ProjectCard project={project.meta} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </Section>
  );
}
