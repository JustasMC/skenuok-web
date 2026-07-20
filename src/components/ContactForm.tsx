"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/lib/site-config";

const servicesLt = [
  "AI SEO auditas / Svetainių skaneris (bandomasis)",
  "Kursų kokybės skenavimas (PageSpeed + AI)",
  "SEO strategija ir turinio jungtis (nuo įrankio iki produkcijos)",
  "Žiniatinklio kūrimas (Next.js / Rust)",
  "Verslo logika ir AI automatizacija",
  "Duomenų analitika (SQL / Power BI / GA4)",
  "Kritinės sistemos ir realaus laiko duomenys",
  "Kita",
] as const;

const servicesEn = [
  "AI SEO audit / site scanner (trial)",
  "Course quality scan (PageSpeed + AI)",
  "SEO strategy & content bridge",
  "Web development (Next.js / Rust)",
  "Business logic & AI automation",
  "Data analytics (SQL / Power BI / GA4)",
  "Critical systems & real-time data",
  "Other",
] as const;

export function ContactForm() {
  const dict = useDict();
  const { locale } = useLocale();
  const services = locale === "en" ? servicesEn : servicesLt;
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          company: data.get("company") || undefined,
          service: data.get("service") || undefined,
          message: data.get("message"),
          website: String(data.get("website") ?? ""),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSec?: number;
        emailSent?: boolean;
        emailDetail?: string;
        emailTo?: string;
      };
      if (res.status === 429) {
        setStatus("err");
        const sec = body.retryAfterSec;
        setMessage(
          body.error ??
            (typeof sec === "number"
              ? locale === "en"
                ? `Too many attempts. Try again in ${sec}s.`
                : `Per daug bandymų. Bandykite po ${sec} s.`
              : locale === "en"
                ? "Too many attempts. Try later."
                : "Per daug bandymų. Bandykite vėliau."),
        );
        return;
      }
      if (!res.ok) {
        setStatus("err");
        setMessage(
          body.error ??
            (locale === "en"
              ? "Could not send. Check the fields or try again later."
              : "Nepavyko išsiųsti. Patikrinkite laukus arba bandykite vėliau."),
        );
        return;
      }
      setStatus("ok");
      if (body.emailSent === false) {
        setMessage(
          locale === "en"
            ? `Message saved, but email to ${body.emailTo ?? siteConfig.contactEmail} failed. ${body.emailDetail ?? "Check Resend settings."}`
            : `Žinutė išsaugota, bet el. laiškas į ${body.emailTo ?? siteConfig.contactEmail} nenuėjo. ${body.emailDetail ?? "Patikrinkite Resend nustatymus."}`,
        );
      } else {
        setMessage(
          locale === "en"
            ? `Message received. Notification sent to ${body.emailTo ?? siteConfig.contactEmail}.`
            : `Žinutė gauta. Pranešimas išsiųstas į ${body.emailTo ?? siteConfig.contactEmail}.`,
        );
      }
      form.reset();
    } catch {
      setStatus("err");
      setMessage(
        locale === "en"
          ? `Could not send. Email us directly: ${siteConfig.contactEmail}`
          : `Nepavyko išsiųsti. Rašykite tiesiogiai: ${siteConfig.contactEmail}`,
      );
    }
  }

  return (
    <section id="kontaktai" className="site-section">
      <div className="site-shell">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="space-y-5 sm:space-y-6">
            <SectionHeader
              eyebrow={dict.contact.title}
              title={locale === "en" ? "Let's start with a short chat" : "Pradėkime nuo trumpo pokalbio"}
              description={dict.contact.lead}
            />
            <ul className="space-y-3 text-sm leading-relaxed text-zinc-300">
              <li className="flex gap-3">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-electric)]" aria-hidden />
                <span>{dict.contact.hint}</span>
              </li>
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            className="site-card relative space-y-5 p-6 shadow-lg shadow-black/25 sm:space-y-4 sm:p-8"
          >
            <div className="pointer-events-none absolute left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0" aria-hidden="true">
              <label htmlFor="contact-website-hp">Website</label>
              <input
                id="contact-website-hp"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={dict.contact.name} name="name" required autoComplete="name" />
              <Field label={dict.contact.email} name="email" type="email" required autoComplete="email" />
            </div>
            <Field
              label={locale === "en" ? "Company (optional)" : "Įmonė (nebūtina)"}
              name="company"
              autoComplete="organization-name"
            />
            <div>
              <label className="block text-sm font-medium text-zinc-300" htmlFor="service">
                {dict.contact.service}
              </label>
              <select
                id="service"
                name="service"
                autoComplete="off"
                className="site-input min-h-11 py-2.5"
                defaultValue={services[0]}
              >
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300" htmlFor="message">
                {dict.contact.message}
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                autoComplete="off"
                className="site-input min-h-[8.5rem] resize-y"
                placeholder={
                  locale === "en" ? "Briefly about the project, timeline and KPIs…" : "Trumpai apie projektą, terminus ir KPI..."
                }
              />
            </div>

            {message ? (
              <p
                className={cn(
                  "text-sm leading-relaxed",
                  status === "ok" ? "text-[var(--color-lime)]" : "text-rose-400",
                )}
                role={status === "err" ? "alert" : "status"}
              >
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="site-btn-lime min-h-11 transition duration-300 ease-in-out hover:brightness-110"
            >
              {status === "loading" ? dict.contact.sending : dict.contact.submit}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-300" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        {...(autoComplete ? { autoComplete } : {})}
        className="site-input min-h-11 w-full text-zinc-100"
      />
    </div>
  );
}
