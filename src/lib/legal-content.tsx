import { CookieTable } from "@/components/legal/CookieTable";
import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import type { LegalTocItem } from "@/components/legal/LegalPageShell";
import { siteConfig } from "@/lib/site-config";

const updated = "2026 m. liepos 2 d.";

export const privacyToc: LegalTocItem[] = [
  { id: "duomenu-valdytojas", label: "1. Duomenų valdytojas" },
  { id: "renkami-duomenys", label: "2. Renkami duomenys" },
  { id: "tikslai-pagrindas", label: "3. Tikslai ir pagrindas" },
  { id: "slapukai", label: "4. Slapukai" },
  { id: "treciosios-salys", label: "5. Trečiosios šalys" },
  { id: "saugojimas", label: "6. Saugojimo terminai" },
  { id: "teises", label: "7. Jūsų teisės" },
  { id: "saugumas", label: "8. Duomenų saugumas" },
  { id: "vaiku-privatumas", label: "9. Vaikų privatumas" },
  { id: "pakeitimai", label: "10. Politikos pakeitimai" },
];

export const termsToc: LegalTocItem[] = [
  { id: "paslaugos", label: "1. Paslaugų apimtis" },
  { id: "paskyra", label: "2. Paskyra ir prieiga" },
  { id: "kreditai", label: "3. Kreditai ir mokėjimai" },
  { id: "ai-turinys", label: "4. AI turinys" },
  { id: "ip", label: "5. Intelektinė nuosavybė" },
  { id: "prieinamumas", label: "6. Prieinamumas" },
  { id: "nutraukimas", label: "7. Nutraukimas" },
  { id: "taikytina-teise", label: "8. Taikytina teisė" },
];

export function PrivacyPolicyContent() {
  return (
    <LegalArticle>
      <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[color-mix(in_oklab,var(--color-surface)_55%,transparent)] px-5 py-4">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Paskutinį kartą atnaujinta:</span> {updated}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Ši politika paaiškina, kaip {siteConfig.name} renka, naudoja ir saugo jūsų asmens duomenis pagal Bendrąjį
          duomenų apsaugos reglamentą (BDAR) ir Lietuvos Respublikos teisės aktus.
        </p>
      </div>

      <LegalSection id="duomenu-valdytojas" title="1. Duomenų valdytojas">
        <p>
          Duomenų valdytojas: <strong className="text-zinc-200">{siteConfig.name}</strong> (prekės ženklas{" "}
          {siteConfig.shortName}).
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Kontaktinis el. paštas:{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
              {siteConfig.contactEmail}
            </a>
          </li>
          <li>Svetainė: skenuok.com</li>
        </ul>
        <p>
          Dėl bet kokių klausimų, susijusių su asmens duomenų tvarkymu, kreipkitės nurodytu el. paštu. Atsakysime per
          protingą terminą, bet ne vėliau kaip per 30 kalendorinių dienų.
        </p>
      </LegalSection>

      <LegalSection id="renkami-duomenys" title="2. Kokius duomenis renkame">
        <p>Renkame tik tuos duomenis, kurie būtini paslaugų teikimui, saugumui ir komunikacijai:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Kontaktų forma:</strong> vardas, el. paštas, įmonė (neprivaloma),
            pasirinkta paslauga, žinutės turinys, techninis laiko žymuo.
          </li>
          <li>
            <strong className="text-zinc-200">Paskyra (prisijungimas):</strong> el. paštas, vardas, profilio nuotrauka
            (jei naudojate Google OAuth), sesijos identifikatoriai.
          </li>
          <li>
            <strong className="text-zinc-200">Mokėjimai:</strong> mokėjimo duomenis apdoroja Stripe; mes saugome
            užsakymo ID, sumą, kreditų balansą ir operacijų žurnalą.
          </li>
          <li>
            <strong className="text-zinc-200">Įrankiai:</strong> vieši URL skenavimui, įvestos temos turinio
            generatoriui, pokalbių istorija SEO agente (prisijungusiems vartotojams).
          </li>
          <li>
            <strong className="text-zinc-200">Techniniai duomenys:</strong> IP adresas (saugumo ir rate limiting
            tikslais), naršyklės tipas, operacinė sistema, laiko juosta, sutikimo dėl slapukų įrašas.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="tikslai-pagrindas" title="3. Tikslai ir teisinis pagrindas">
        <p>Duomenis tvarkome šiais tikslais:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Paslaugų teikimas</strong> — sutarties vykdymas (BDAR 6 str. 1 d. b
            punktas).
          </li>
          <li>
            <strong className="text-zinc-200">Užklausų atsakymas ir palaikymas</strong> — teisėtas interesas (BDAR 6
            str. 1 d. f punktas).
          </li>
          <li>
            <strong className="text-zinc-200">Saugumas ir piktnaudžiavimo prevencija</strong> — teisėtas interesas.
          </li>
          <li>
            <strong className="text-zinc-200">Analitika</strong> — sutikimas (BDAR 6 str. 1 d. a punktas), tik jei
            sutinkate su analitikos slapukais.
          </li>
          <li>
            <strong className="text-zinc-200">Teisinės prievolės</strong> — apskaita, mokesčiai, ginčų sprendimas (BDAR
            6 str. 1 d. c punktas).
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="slapukai" title="4. Slapukai ir panašios technologijos">
        <p>
          Slapukai — maži tekstiniai failai, saugomi jūsų įrenginyje. Naudojame būtinus slapukus svetainės veikimui;
          analitikos slapukus — tik gavę jūsų sutikimą per slapukų juostą puslapio apačioje.
        </p>
        <CookieTable />
        <p className="text-zinc-400">
          Sutikimą galite bet kada atšaukti ištrindami naršyklės slapukus ir localStorage įrašą, arba pakeisdami
          naršyklės nustatymus. Būtini slapukai reikalingi prisijungimui ir pagrindinėms funkcijoms.
        </p>
      </LegalSection>

      <LegalSection id="treciosios-salys" title="5. Trečiosios šalys ir duomenų perdavimas">
        <p>Duomenis gali perduoti šie patikimi procesoriai:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Stripe</strong> — mokėjimų apdorojimas (JAV / ES, SCC arba adekvatumo
            sprendimas).
          </li>
          <li>
            <strong className="text-zinc-200">Google</strong> — OAuth prisijungimas, PageSpeed Insights API, Analytics
            (su sutikimu).
          </li>
          <li>
            <strong className="text-zinc-200">OpenAI</strong> — AI funkcijos (turinio generavimas, rekomendacijos).
          </li>
          <li>
            <strong className="text-zinc-200">Resend / SMTP</strong> — el. pašto pranešimai.
          </li>
          <li>
            <strong className="text-zinc-200">Railway</strong> — hostingas ir duomenų bazė (PostgreSQL).
          </li>
        </ul>
        <p>
          Duomenų perdavimas už EEE vykdomas tik su tinkamomis apsaugos priemonėmis (standartinės sutarčių sąlygos,
          adekvatumo sprendimai arba tiekėjo sertifikatai). Su kiekvienu procesoriumi sudaromos duomenų tvarkymo
          sutartys, kai tai taikoma.
        </p>
      </LegalSection>

      <LegalSection id="saugojimas" title="6. Saugojimo terminai">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-zinc-200">Kontaktų užklausos</strong> — iki 24 mėn. po paskutinio kontakto arba
            kol galioja teisinis interesas.
          </li>
          <li>
            <strong className="text-zinc-200">Paskyros duomenys</strong> — kol paskyra aktyvi; ištrinami per 30 d. po
            paskyros ištrynimo prašymo.
          </li>
          <li>
            <strong className="text-zinc-200">Mokėjimų ir kreditų žurnalas</strong> — pagal apskaitos ir mokesčių
            reikalavimus (paprastai iki 10 m.).
          </li>
          <li>
            <strong className="text-zinc-200">Serverio žurnalai</strong> — iki 90 d., nebent reikalinga saugumo
            tyrimui.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="teises" title="7. Jūsų teisės pagal BDAR">
        <p>Turite šias teises:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>sužinoti, ar tvarkome jūsų duomenis, ir gauti jų kopiją;</li>
          <li>reikalauti ištaisyti netikslius duomenis;</li>
          <li>reikalauti ištrinti duomenis („būti pamirštam“);</li>
          <li>apriboti tvarkymą arba nesutikti su tvarkymu;</li>
          <li>gauti duomenis struktūruota forma (perkeliamumas);</li>
          <li>bet kada atšaukti sutikimą dėl analitikos (neturint įtakos ankstesniam tvarkymui);</li>
          <li>pateikti skundą Valstybinei duomenų apsaugos inspekcijai (VDAI):{" "}
            <a href="https://vdai.lrv.lt" className="site-link-inline" rel="noopener noreferrer" target="_blank">
              vdai.lrv.lt
            </a>
            .
          </li>
        </ul>
        <p>
          Prašymams rašykite{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          . Tapatybę patvirtinsime protingomis priemonėmis prieš atskleidžiant duomenis.
        </p>
      </LegalSection>

      <LegalSection id="saugumas" title="8. Duomenų saugumas">
        <p>
          Taikome technines ir organizacines priemones: HTTPS šifravimą, slaptažodžių ir API raktų saugojimą aplinkos
          kintamuosiuose, rate limiting, prieigos kontrolę prie administracinių funkcijų, reguliarų programinės įrangos
          atnaujinimą. Nors siekiame aukšto saugumo lygio, jokia internetinė sistema negali garantuoti absoliutaus
          saugumo.
        </p>
      </LegalSection>

      <LegalSection id="vaiku-privatumas" title="9. Vaikų privatumas">
        <p>
          Paslaugos neskirtos asmenims iki 16 metų. Sąmoningai nerenkame vaikų duomenų. Jei sužinotume, kad surinkome
          nepilnamečio duomenis be tėvų sutikimo, juos ištrintume nedelsiant.
        </p>
      </LegalSection>

      <LegalSection id="pakeitimai" title="10. Politikos pakeitimai">
        <p>
          Politiką galime atnaujinti dėl teisės aktų, paslaugų ar technologijų pokyčių. Esminiai pakeitimai bus
          paskelbti šiame puslapyje su nauja data. Rekomenduojame periodiškai peržiūrėti šį dokumentą.
        </p>
      </LegalSection>
    </LegalArticle>
  );
}

export function TermsOfServiceContent() {
  return (
    <LegalArticle>
      <div className="rounded-2xl border border-[var(--color-border)]/70 bg-[color-mix(in_oklab,var(--color-surface)_55%,transparent)] px-5 py-4">
        <p className="text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Paskutinį kartą atnaujinta:</span> {updated}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Naudodamiesi {siteConfig.name} svetaine ir įrankiais, sutinkate su šiomis paslaugų sąlygomis. Jei nesutinkate
          — prašome nesinaudoti paslaugomis.
        </p>
      </div>

      <LegalSection id="paslaugos" title="1. Paslaugų apimtis">
        <p>
          {siteConfig.name} teikia SEO ir AI įrankius (URL skeneris, turinio generatorius, SEO agentas ir kt.),
          kreditų sistemą bei susijusias konsultacines ir svetainių kūrimo paslaugas. Konkreti funkcijų apimtis gali
          keistis atnaujinant platformą.
        </p>
      </LegalSection>

      <LegalSection id="paskyra" title="2. Paskyra ir prieiga">
        <p>
          Kai kurios funkcijos reikalauja prisijungimo per Google OAuth arba kitus palaikomus metodus. Esate atsakingi už
          paskyros saugumą ir visą veiklą jūsų paskyroje.
        </p>
        <p>Draudžiama:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>naudoti paslaugą neteisėtiems tikslams ar trečiųjų šalių teisių pažeidimui;</li>
          <li>automatiškai kreipti didelį užklausų srautą (scraping, DDoS, API piktnaudžiavimas);</li>
          <li>bandyti apeiti kreditų, autentifikacijos ar saugumo mechanizmus;</li>
          <li>dalintis paskyros prieiga su neautorizuotais asmenimis.</li>
        </ul>
      </LegalSection>

      <LegalSection id="kreditai" title="3. Kreditai ir mokėjimai">
        <p>
          Mokami planai apmokestinami per Stripe. Kainos nurodytos su PVM, jei taikoma. Kreditai nurašomi naudojant
          įrankius pagal galiojančią kainodarą puslapyje{" "}
          <a href="/pricing" className="site-link-inline">
            /pricing
          </a>
          .
        </p>
        <p>
          Po sėkmingo mokėjimo kreditai įskaitomi automatiškai. Pakartotinis webhook arba sinchronizacija nedubliuoja
          balanso (idempotentiškas apdorojimas). Grąžinimai sprendžiami individualiai pagal Lietuvos vartotojų teisių
          įstatymą ir sutarties sąlygas. Techninių klaidų atveju kreipkitės{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="ai-turinys" title="4. AI turinys ir atsakomybė">
        <p>
          AI generuotas turinys, rekomendacijos ir skenavimo išvados pateikiamos informaciniais tikslais. Prieš
          publikuodami turinį, priimdami investicinius, teisinius ar verslo sprendimus — patikrinkite faktus, teisę ir
          atitiktį savo sektoriui.
        </p>
        <p>
          Mes neatsakome už netiesioginius nuostolius, prarastą pelną ar reputacijos žalą, kilusią dėl AI išvesties
          naudojimo be žmogaus peržiūros.
        </p>
      </LegalSection>

      <LegalSection id="ip" title="5. Intelektinė nuosavybė">
        <p>
          Svetainės kodas, dizainas, prekės ženklas {siteConfig.name} ir {siteConfig.shortName} priklauso teisėtiems
          savininkams. Jūsų įvestas turinys (URL, temos, žinutės) lieka jūsų; suteikiate mums ribotą, neišimtinę
          licenciją jį apdoroti paslaugų teikimui.
        </p>
      </LegalSection>

      <LegalSection id="prieinamumas" title="6. Paslaugos prieinamumas">
        <p>
          Siekiame aukšto veikimo laiko ir saugumo, tačiau negarantuojame nepertraukiamo darbo. Planuojami ar skubūs
          atnaujinimai gali laikinai apriboti prieigą. Rate limiting taikomas siekiant apsaugoti infrastruktūrą nuo
          piktnaudžiavimo.
        </p>
      </LegalSection>

      <LegalSection id="nutraukimas" title="7. Sutarties nutraukimas">
        <p>
          Galite bet kada nustoti naudotis paslauga ir paprašyti paskyros ištrynimo. Pasiliekame teisę sustabdyti ar
          nutraukti prieigą, jei pažeidžiate šias sąlygas, keliate saugumo riziką arba ilgą laiką neaktyvu naudojatės
          paskyra. Neišnaudoti mokami kreditai grąžinami tik pagal galiojančią teisę ir mūsų grąžinimų politiką.
        </p>
      </LegalSection>

      <LegalSection id="taikytina-teise" title="8. Taikytina teisė ir ginčai">
        <p>
          Sąlygoms taikoma Lietuvos Respublikos teisė. Ginčus siekiame spręsti derybomis. Nepavykus — ginčai nagrinėjami
          Lietuvos Respublikos teismuose pagal galiojančius procesinius įstatymus.
        </p>
        <p>
          Kontaktai:{" "}
          <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalArticle>
  );
}
