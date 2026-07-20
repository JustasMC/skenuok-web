import { CookieTable } from "@/components/legal/CookieTable";
import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import type { LegalTocItem } from "@/components/legal/LegalPageShell";
import { siteConfig } from "@/lib/site-config";

const updated = "2 July 2026";

export const privacyTocEn: LegalTocItem[] = [
  { id: "duomenu-valdytojas", label: "1. Data controller" },
  { id: "renkami-duomenys", label: "2. Data we collect" },
  { id: "tikslai-pagrindas", label: "3. Purposes and legal basis" },
  { id: "slapukai", label: "4. Cookies" },
  { id: "treciosios-salys", label: "5. Third parties" },
  { id: "saugojimas", label: "6. Retention periods" },
  { id: "teises", label: "7. Your rights" },
  { id: "saugumas", label: "8. Data security" },
  { id: "vaiku-privatumas", label: "9. Children's privacy" },
  { id: "pakeitimai", label: "10. Policy changes" },
];

export const termsTocEn: LegalTocItem[] = [
  { id: "paslaugos", label: "1. Scope of services" },
  { id: "paskyra", label: "2. Account and access" },
  { id: "kreditai", label: "3. Credits and payments" },
  { id: "ai-turinys", label: "4. AI content" },
  { id: "ip", label: "5. Intellectual property" },
  { id: "prieinamumas", label: "6. Availability" },
  { id: "nutraukimas", label: "7. Termination" },
  { id: "taikytina-teise", label: "8. Governing law" },
];

export function PrivacyPolicyContentEn() {
  return (
    <LegalArticle>
      <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[color-mix(in_oklab,var(--color-surface)_55%,transparent)] px-5 py-4">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Last updated:</span> {updated}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          This policy explains how {siteConfig.name} collects, uses, and protects your personal data in accordance with
          the General Data Protection Regulation (GDPR) and the laws of the Republic of Lithuania.
        </p>
      </div>

      <LegalSection id="duomenu-valdytojas" title="1. Data controller">
        <p>
          Data controller: <strong className="text-zinc-200">{siteConfig.name}</strong>.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Contact email:{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
              {siteConfig.contactEmail}
            </a>
          </li>
          <li>Website: skenuok.com</li>
        </ul>
        <p>
          For any questions relating to the processing of personal data, please contact us at the email address above. We
          will respond within a reasonable period and no later than 30 calendar days.
        </p>
      </LegalSection>

      <LegalSection id="renkami-duomenys" title="2. Data we collect">
        <p>We collect only the data necessary to provide our services, maintain security, and communicate with you:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Contact form:</strong> name, email address, company (optional), selected
            service, message content, technical timestamp.
          </li>
          <li>
            <strong className="text-zinc-200">Account (sign-in):</strong> email address, name, profile photo (if you use
            Google OAuth), session identifiers.
          </li>
          <li>
            <strong className="text-zinc-200">Payments:</strong> payment data is processed by Stripe; we store order ID,
            amount, credit balance, and transaction logs.
          </li>
          <li>
            <strong className="text-zinc-200">Tools:</strong> public URLs for scanning, topics entered into the content
            generator, conversation history in the SEO agent (for signed-in users).
          </li>
          <li>
            <strong className="text-zinc-200">Technical data:</strong> IP address (for security and rate limiting),
            browser type, operating system, time zone, cookie consent record.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="tikslai-pagrindas" title="3. Purposes and legal basis">
        <p>We process personal data for the following purposes:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Providing services</strong> — performance of a contract (GDPR Art. 6(1)(b)).
          </li>
          <li>
            <strong className="text-zinc-200">Responding to enquiries and support</strong> — legitimate interest (GDPR
            Art. 6(1)(f)).
          </li>
          <li>
            <strong className="text-zinc-200">Security and abuse prevention</strong> — legitimate interest.
          </li>
          <li>
            <strong className="text-zinc-200">Analytics</strong> — consent (GDPR Art. 6(1)(a)), only if you accept
            analytics cookies.
          </li>
          <li>
            <strong className="text-zinc-200">Legal obligations</strong> — accounting, tax, and dispute resolution (GDPR
            Art. 6(1)(c)).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="slapukai" title="4. Cookies and similar technologies">
        <p>
          Cookies are small text files stored on your device. We use essential cookies for the website to function;
          analytics cookies are used only after you give consent via the cookie banner at the bottom of the page.
        </p>
        <CookieTable />
        <p className="text-zinc-400">
          You may withdraw consent at any time by clearing browser cookies and the localStorage record, or by changing
          your browser settings. Essential cookies are required for sign-in and core functionality.
        </p>
      </LegalSection>

      <LegalSection id="treciosios-salys" title="5. Third parties and data transfers">
        <p>Data may be transferred to the following trusted processors:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Stripe</strong> — payment processing (US / EU, SCC or adequacy decision).
          </li>
          <li>
            <strong className="text-zinc-200">Google</strong> — OAuth sign-in, PageSpeed Insights API, Analytics (with
            consent).
          </li>
          <li>
            <strong className="text-zinc-200">OpenAI</strong> — AI features (content generation, recommendations).
          </li>
          <li>
            <strong className="text-zinc-200">Resend / SMTP</strong> — email notifications.
          </li>
          <li>
            <strong className="text-zinc-200">Railway</strong> — hosting and database (PostgreSQL).
          </li>
        </ul>
        <p>
          Transfers of data outside the European Economic Area (EEA) are carried out only with appropriate safeguards
          (standard contractual clauses, adequacy decisions, or vendor certifications). We enter into data processing
          agreements with each processor where applicable.
        </p>
      </LegalSection>

      <LegalSection id="saugojimas" title="6. Retention periods">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Contact enquiries</strong> — up to 24 months after the last contact, or
            while a legitimate interest remains.
          </li>
          <li>
            <strong className="text-zinc-200">Account data</strong> — while the account is active; deleted within 30 days
            of an account deletion request.
          </li>
          <li>
            <strong className="text-zinc-200">Payment and credit logs</strong> — as required by accounting and tax law
            (typically up to 10 years).
          </li>
          <li>
            <strong className="text-zinc-200">Server logs</strong> — up to 90 days, unless needed for a security
            investigation.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="teises" title="7. Your rights under the GDPR">
        <p>You have the following rights:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>to know whether we process your data and to obtain a copy;</li>
          <li>to request correction of inaccurate data;</li>
          <li>to request erasure of data (&ldquo;right to be forgotten&rdquo;);</li>
          <li>to restrict processing or object to processing;</li>
          <li>to receive data in a structured format (data portability);</li>
          <li>to withdraw consent for analytics at any time (without affecting prior processing);</li>
          <li>
            to lodge a complaint with the State Data Protection Inspectorate of Lithuania (VDAI):{" "}
            <a href="https://vdai.lrv.lt" className="site-link-inline" rel="noopener noreferrer" target="_blank">
              vdai.lrv.lt
            </a>
            .
          </li>
        </ul>
        <p>
          For requests, email{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          . We will verify your identity by reasonable means before disclosing data.
        </p>
      </LegalSection>

      <LegalSection id="saugumas" title="8. Data security">
        <p>
          We apply technical and organisational measures including HTTPS encryption, storage of passwords and API keys in
          environment variables, rate limiting, access controls for administrative functions, and regular software
          updates. While we strive for a high level of security, no online system can guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection id="vaiku-privatumas" title="9. Children's privacy">
        <p>
          Our services are not intended for persons under 16 years of age. We do not knowingly collect data from children.
          If we learn that we have collected a minor&apos;s data without parental consent, we will delete it promptly.
        </p>
      </LegalSection>

      <LegalSection id="pakeitimai" title="10. Policy changes">
        <p>
          We may update this policy due to changes in law, services, or technology. Material changes will be published on
          this page with a new date. We recommend reviewing this document periodically.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}

export function TermsOfServiceContentEn() {
  return (
    <LegalArticle>
      <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[color-mix(in_oklab,var(--color-surface)_55%,transparent)] px-5 py-4">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Last updated:</span> {updated}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          By using the {siteConfig.name} website and tools, you agree to these terms of service. If you do not agree,
          please do not use our services.
        </p>
      </div>

      <LegalSection id="paslaugos" title="1. Scope of services">
        <p>
          {siteConfig.name} provides SEO and AI tools (URL scanner, content generator, SEO agent, and related features),
          a credit system, and associated consulting and web development services. The specific scope of features may
          change as we update the platform.
        </p>
      </LegalSection>

      <LegalSection id="paskyra" title="2. Account and access">
        <p>
          Certain features require sign-in via Google OAuth or other supported methods. You are responsible for account
          security and all activity under your account.
        </p>
        <p>You must not:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>use the service for unlawful purposes or to infringe third-party rights;</li>
          <li>automate high-volume requests (scraping, DDoS, API abuse);</li>
          <li>attempt to bypass credits, authentication, or security mechanisms;</li>
          <li>share account access with unauthorised persons.</li>
        </ul>
      </LegalSection>

      <LegalSection id="kreditai" title="3. Credits and payments">
        <p>
          Paid plans are billed through Stripe. Prices are shown inclusive of VAT where applicable. Credits are deducted
          when you use tools according to the current pricing on the{" "}
          <a href="/pricing" className="site-link-inline">
            Pricing
          </a>{" "}
          page.
        </p>
        <p>
          Credits are credited automatically after successful payment. Repeated webhooks or synchronisation do not
          duplicate the balance (idempotent processing). Refunds are handled on a case-by-case basis under Lithuanian
          consumer protection law and these terms. For technical errors, contact{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="ai-turinys" title="4. AI content and liability">
        <p>
          AI-generated content, recommendations, and scan findings are provided for informational purposes only. Before
          publishing content or making investment, legal, or business decisions, verify facts, rights, and compliance for
          your sector.
        </p>
        <p>
          We are not liable for indirect losses, lost profits, or reputational harm arising from use of AI output without
          human review.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="5. Intellectual property">
        <p>
          The website code, design, and {siteConfig.name} brand belong to their lawful owners. Content you submit (URLs,
          topics, messages) remains yours; you grant us a limited, non-exclusive licence to process it for service
          delivery.
        </p>
      </LegalSection>

      <LegalSection id="prieinamumas" title="6. Service availability">
        <p>
          We aim for high uptime and security but do not guarantee uninterrupted operation. Planned or emergency
          maintenance may temporarily limit access. Rate limiting is applied to protect infrastructure from abuse.
        </p>
      </LegalSection>

      <LegalSection id="nutraukimas" title="7. Termination">
        <p>
          You may stop using the service at any time and request account deletion. We reserve the right to suspend or
          terminate access if you breach these terms, pose a security risk, or remain inactive for an extended period.
          Unused paid credits are refunded only where required by applicable law and our refund policy.
        </p>
      </LegalSection>

      <LegalSection id="taikytina-teise" title="8. Governing law and disputes">
        <p>
          These terms are governed by the laws of the Republic of Lithuania. We seek to resolve disputes through
          negotiation. If that fails, disputes shall be heard by the courts of the Republic of Lithuania in accordance
          with applicable procedural law.
        </p>
        <p>
          Contact:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
