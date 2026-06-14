"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-amber/60";
const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wide text-muted-foreground";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");
    setError("");

    try {
      const res = await fetch(site.formspreeEndpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        const data = await res.json().catch(() => null);
        setError(
          data?.errors?.[0]?.message ??
            "Something went wrong sending your message. Please try again.",
        );
        setStatus("error");
      }
    } catch {
      setError("Network error. Please try again, or reach me on LinkedIn below.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-amber/40 bg-amber/5 p-6 text-center">
        <p className="font-medium text-foreground">Thanks — your message is on its way.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          I&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* honeypot — bots fill this, humans don't see it */}
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input id="name" name="name" required className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className={cn(fieldClass, "resize-y")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting"}
          className={cn(buttonVariants({ size: "lg" }), "disabled:opacity-60")}
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        {status === "error" && (
          <p className="text-sm text-red-300">{error}</p>
        )}
      </div>
    </form>
  );
}
