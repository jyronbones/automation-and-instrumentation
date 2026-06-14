import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-sm text-foreground">{site.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{site.location}</p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={`mailto:${site.email}`}
            aria-label="Email"
            className="text-muted-foreground transition-colors hover:text-amber"
          >
            <Mail className="size-5" />
          </Link>
          <Link
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground transition-colors hover:text-amber"
          >
            <GithubIcon className="size-5" />
          </Link>
          <Link
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground transition-colors hover:text-amber"
          >
            <LinkedinIcon className="size-5" />
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 pb-8">
        <p className="font-mono text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} {site.name} — built with Next.js & deployed on Vercel.
        </p>
      </div>
    </footer>
  );
}
