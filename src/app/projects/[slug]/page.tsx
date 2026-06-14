import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ArrowLeft } from "lucide-react";
import { GithubIcon } from "@/components/brand-icons";
import { Section } from "@/components/section";
import { SkillPill } from "@/components/skill-pill";
import { mdxComponents } from "@/components/mdx-components";
import { getAllProjects, getProject, getProjectSlugs } from "@/lib/projects";

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.meta.title,
    description: project.meta.summary,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const { content } = await compileMDX({
    source: project.content,
    components: mdxComponents,
    options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
  });

  return (
    <Section className="max-w-3xl pt-12 md:pt-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-amber"
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      <header className="mt-6 border-b border-border pb-8">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {project.meta.title}
        </h1>
        {project.meta.summary && (
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            {project.meta.summary}
          </p>
        )}

        {project.meta.skills.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.meta.skills.map((skill) => (
              <SkillPill key={skill}>{skill}</SkillPill>
            ))}
          </div>
        )}

        {project.meta.repo && (
          <Link
            href={project.meta.repo}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-amber underline-offset-4 hover:underline"
          >
            <GithubIcon className="size-4" />
            View project files on GitHub
          </Link>
        )}
      </header>

      <article>{content}</article>
    </Section>
  );
}
