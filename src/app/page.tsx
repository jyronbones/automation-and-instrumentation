import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Section, SectionLabel } from "@/components/section";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ProjectCard } from "@/components/project-card";
import { getAllProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default function HomePage() {
  const featured = getAllProjects().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <Section className="pt-20 md:pt-28">
        <ScrollReveal delay={0.05}>
          <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            {site.name}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="mt-4 font-mono text-sm text-amber md:text-base">
            {site.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {site.tagline}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              View projects
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              GitHub
            </Link>
          </div>
        </ScrollReveal>
      </Section>

      {/* Featured projects */}
      <Section className="pt-0">
        <ScrollReveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <SectionLabel>Selected work</SectionLabel>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Control logic projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden shrink-0 items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-amber sm:flex"
            >
              All projects
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((project, i) => (
            <ScrollReveal key={project.meta.slug} delay={i * 0.06}>
              <ProjectCard project={project.meta} />
            </ScrollReveal>
          ))}
        </div>
      </Section>
    </>
  );
}
