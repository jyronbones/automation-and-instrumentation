"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ProjectMeta } from "@/lib/projects";
import { SkillPill } from "@/components/skill-pill";

/** Project index card: hover lift + amber edge highlight. */
export function ProjectCard({ project }: { project: ProjectMeta }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group h-full"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors duration-300 hover:border-amber/50 hover:shadow-[0_0_0_1px_rgba(255,176,32,0.12),0_8px_30px_-12px_rgba(0,0,0,0.6)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold leading-snug text-foreground">
            {project.title}
          </h3>
          <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-amber" />
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {project.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.skills.slice(0, 4).map((skill) => (
            <SkillPill key={skill}>{skill}</SkillPill>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
