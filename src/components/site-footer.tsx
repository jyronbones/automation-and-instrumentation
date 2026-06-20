import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <Link
          href={site.mainSite}
          className="group inline-flex items-center gap-1.5 font-mono text-sm text-muted-foreground transition-colors hover:text-amber"
        >
          byronjones.vercel.app
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>

        <div className="flex items-center gap-4">
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
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
