import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "src", "content", "projects");

export interface ProjectMeta {
  /** URL slug, derived from the filename. */
  slug: string;
  /** Display title, e.g. "Motor Start/Stop Control System". */
  title: string;
  /** One-line problem statement shown on the index cards. */
  summary: string;
  /** Skill tags, rendered as monospace pills. */
  skills: string[];
  /** Sort order on the index (ascending). */
  order: number;
  /** Optional link to the GitHub repo with the project files. */
  repo?: string;
  /** Optional cover image path (under /public). */
  cover?: string;
  /** Marks the lead / strongest project. */
  featured?: boolean;
}

export interface Project {
  meta: ProjectMeta;
  /** Raw MDX body (without frontmatter). */
  content: string;
}

function readProjectFile(slug: string): Project {
  const fullPath = path.join(PROJECTS_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug,
      title: data.title ?? slug,
      summary: data.summary ?? "",
      skills: data.skills ?? [],
      order: data.order ?? 999,
      repo: data.repo,
      cover: data.cover,
      featured: data.featured ?? false,
    },
    content,
  };
}

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

export function getProject(slug: string): Project | null {
  try {
    return readProjectFile(slug);
  } catch {
    return null;
  }
}

export function getAllProjects(): Project[] {
  return getProjectSlugs()
    .map(readProjectFile)
    .sort((a, b) => a.meta.order - b.meta.order);
}
