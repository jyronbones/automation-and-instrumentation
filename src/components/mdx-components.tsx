/* eslint-disable @next/next/no-img-element */
import type { MDXComponents } from "mdx/types";

/** Styling map for MDX project bodies — keeps the industrial tone. */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-12 scroll-mt-24 text-xl font-semibold tracking-tight text-foreground md:text-2xl"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 text-lg font-semibold tracking-tight text-foreground"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-4 text-base leading-relaxed text-muted-foreground" {...props} />
  ),
  ul: (props) => (
    <ul
      className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-amber"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-muted-foreground marker:text-amber"
      {...props}
    />
  ),
  li: (props) => <li className="pl-1" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-amber underline-offset-4 hover:underline"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
      {...props}
    />
  ),
  strong: (props) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  code: (props) => (
    <code
      className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-amber"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-lg border border-border bg-secondary/40 p-4 font-mono text-sm leading-relaxed"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 border-amber/60 pl-4 italic text-muted-foreground"
      {...props}
    />
  ),
  img: ({ src, alt }) => (
    <figure className="mt-8">
      <img
        src={typeof src === "string" ? src : ""}
        alt={alt ?? ""}
        className="w-full rounded-lg border border-border"
      />
      {alt && (
        <figcaption className="mt-2 text-center font-mono text-xs text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  ),
  hr: () => <hr className="mt-10 border-border" />,
  table: (props) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props) => (
    <th
      className="border border-border bg-secondary/40 px-3 py-2 text-left font-mono text-xs uppercase tracking-wide text-foreground"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border border-border px-3 py-2 text-muted-foreground" {...props} />
  ),
};
