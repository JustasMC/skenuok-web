import type { Metadata } from "next";
import { getCanonicalPath } from "@/lib/site-url";
import { TestEmailClient } from "./TestEmailClient";

const pageTitle = "Testinis el. paštas";

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/test-email");
  return {
    title: pageTitle,
    description: "Vidinis puslapis Resend API testui. Neindeksuojamas.",
    alternates: { canonical },
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default function TestEmailPage() {
  return <TestEmailClient />;
}
