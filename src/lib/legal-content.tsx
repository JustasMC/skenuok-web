import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import { siteConfig } from "@/lib/site-config";

const updated = "2026 m. birželio 29 d.";

export function PrivacyPolicyContent() {
  return (
    <LegalArticle>
      <p className="text-zinc-400">Paskutinį kartą atnaujinta: {updated}</p>

      <LegalSection title="1. Duomenų valdytojas">
        <p>
          Ši privatumo politika taikoma svetainei <strong className="text-zinc-200">{siteConfig.name}</strong> (
          {siteConfig.shortName}) ir jos teikiamoms paslaugoms. Klausimais dėl duomenų tvarkymo kreipkitės:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Kokius duomenis renkame">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Kontaktų forma:</strong> vardas, el. paštas, įmonė (neprivaloma), žinutė,
            pasirinkta paslauga.
          </li>
          <li>
            <strong className="text-zinc-200">Paskyra:</strong> el. paštas, vardas, profilio nuotrauka (jei prisijungiate
            per Google), sesijos duomenys.
          </li>
          <li>
            <strong className="text-zinc-200">Mokėjimai:</strong> Stripe apdoroja mokėjimo duomenis; mes saugome užsakymo
            metaduomenis ir kreditų judėjimą.
          </li>
          <li>
            <strong className="text-zinc-200">Įrankiai:</strong> vieši URL skenavimui, temos turinio generatoriui, pokalbių
            istorija SEO agente (prisijungusiems vartotojams).
          </li>
          <li>
            <strong className="text-zinc-200">Techniniai duomenys:</strong> IP adresas (rate limiting), slapukai, naršyklės
            tipas, analitika (jei įjungta GA4).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Tikslai ir teisinis pagrindas">
        <p>Pduomenis tvarkome siekdami:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>teikti paslaugas ir įrankius (sutarties vykdymas);</li>
          <li>atsakyti į užklausas ir palaikyti klientus (teisėtas interesas);</li>
          <li>užtikrinti saugumą ir piktnaudžiavimo prevenciją (teisėtas interesas);</li>
          <li>vykdyti teisines prievoles (apskaita, mokesčiai).</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Slapukai">
        <p>
          Naudojame būtinus slapukus sesijai ir generatoriaus anoniminei sesijai (<code className="text-zinc-400">gen_session</code>
          ). Analitikos slapukai naudojami tik jei nustatytas <code className="text-zinc-400">NEXT_PUBLIC_GA_ID</code>. Galite
          valdyti slapukus naršyklės nustatymuose.
        </p>
      </LegalSection>

      <LegalSection title="5. Trečiosios šalys">
        <p>Duomenys gali būti perduodami patikimiems procesoriams paslaugų teikimui:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Stripe (mokėjimai), Google (OAuth, PageSpeed API), OpenAI (AI funkcijos), Resend/SMTP (el. paštas), hostingo
            tiekėjas (Railway ar pan.).</li>
        </ul>
        <p>Šie tiekėjai tvarko duomenis pagal savo privatumo politikas ir sutartis su mumis.</p>
      </LegalSection>

      <LegalSection title="6. Saugojimo terminai">
        <p>
          Kontaktų užklausas saugome tiek, kiek reikia komunikacijai ir verslo dokumentams. Paskyros duomenys — kol turite
          aktyvią paskyrą arba kol paprašote ištrinti. Kreditų žurnalas — audito ir aptarnavimo tikslais pagal poreikį.
        </p>
      </LegalSection>

      <LegalSection title="7. Jūsų teisės">
        <p>
          Pagal BDAR turite teisę susipažinti su duomenimis, reikalauti ištaisyti, ištrinti, apriboti tvarkymą, nesutikti ar
          perkelti duomenis. Skundą galite pateikti Valstybinei duomenų apsaugos inspekcijai. Prašymams rašykite{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalArticle>
  );
}

export function TermsOfServiceContent() {
  return (
    <LegalArticle>
      <p className="text-zinc-400">Paskutinį kartą atnaujinta: {updated}</p>

      <LegalSection title="1. Paslaugos apimtis">
        <p>
          {siteConfig.name} teikia SEO ir AI įrankius (URL skeneris, turinio generatorius, SEO agentas ir kt.), kreditų
          sistemą bei susijusias konsultacines ir kūrimo paslaugas. Naudodamiesi svetaine sutinkate su šiomis sąlygomis.
        </p>
      </LegalSection>

      <LegalSection title="2. Paskyra ir prieiga">
        <p>
          Kai kurios funkcijos reikalauja prisijungimo. Esate atsakingi už paskyros saugumą. Draudžiama dalintis prisijungimo
          duomenimis ar naudoti paslaugą neteisėtiems tikslams, įskaitant automatizuotą piktnaudžiavimą ir API perkrovą.
        </p>
      </LegalSection>

      <LegalSection title="3. Kreditai ir mokėjimai">
        <p>
          Mokami planai apmokestinami per Stripe. Kreditai nurašomi naudojant įrankius pagal galiojančią kainodarą. Po
          sėkmingo mokėjimo kreditai įskaitomi idempotentiškai (pakartotinis webhook arba sinchronizacija nedubliuoja
          balanso). Grąžinimai — individualiai pagal Lietuvos vartotojų teisių ir sutarties sąlygas; techninių klaidų atveju
          kreipkitės {siteConfig.contactEmail}.
        </p>
      </LegalSection>

      <LegalSection title="4. AI turinys ir atsakomybė">
        <p>
          AI generuotas turinys, rekomendacijos ir skenavimo išvados pateikiamos informaciniais tikslais. Prieš publikuodami
          turinį ar priimdami verslo sprendimus, patikrinkite faktus, teisę ir atitiktį savo sektoriui. Mes neatsakome už
          netiesioginius nuostolius dėl AI išvesties naudojimo be peržiūros.
        </p>
      </LegalSection>

      <LegalSection title="5. Intelektinė nuosavybė">
        <p>
          Svetainės kodas, dizainas ir prekės ženklas {siteConfig.shortName} / {siteConfig.name} priklauso teisėtiems
          savininkams. Jūsų įvestas turinys (URL, temos, žinutės) lieka jūsų; suteikiate mums ribotą licenciją jį apdoroti
          paslaugų teikimui.
        </p>
      </LegalSection>

      <LegalSection title="6. Paslaugos prieinamumas">
        <p>
          Siekiame aukšto veikimo laiko, tačiau negarantuojame nepertraukiamo darbo. Planuojami ar skubūs atnaujinimai gali
          laikinai apriboti prieigą. Rate limiting taikomas siekiant apsaugoti infrastruktūrą.
        </p>
      </LegalSection>

      <LegalSection title="7. Taikytina teisė">
        <p>
          Sąlygoms taikoma Lietuvos Respublikos teisė. Ginčai sprendžiami derybomis; nepavykus — kompetentingas Lietuvos
          teismas. Kontaktai:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
