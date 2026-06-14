import Link from "next/link";
import { Mail } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/brand-icons";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/contact"
            aria-label="Contact"
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
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
