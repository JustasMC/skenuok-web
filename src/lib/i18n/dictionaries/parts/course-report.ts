export const courseReportLt = {
  verdictBadge: {
    SAUGU: "Skeptiko verdiktas: saugu",
    ATSARGIAI: "Skeptiko verdiktas: atsargiai",
    RIZIKA: "Skeptiko verdiktas: rizika",
    SCAM: "Skeptiko verdiktas: tikėtinas scam",
  },
  verdictRec: {
    search_free: "Pirmiausia – nemokami šaltiniai",
    consider: "Verta svarstyti",
    likely_fair: "Kaina gali būti pagrįsta",
    unclear: "Neaišku / nepakanka duomenų",
  },
  instructorBadge: {
    anonymous: "Anonimas",
    pseudonym: "Slapyvardis",
    named_real: "Įvardytas",
    unclear: "Neaišku",
    instructorLabel: "Lektorius:",
    identityTitle: "Lektoriaus tapatybė: {presence}",
  },
  instructorTrust: {
    sectionTitle: "Lektoriaus patikra",
    identityLabel: "Identitetas:",
    credentialsLabel: "Kvalifikacija / užuominos tekste:",
    serperPrefix: "Serper:",
    anonymous: {
      badge: "Anoniminis lektorius",
      detail:
        "Konkretaus asmens nėra arba tapatybė slepiama — pretenzijoms ir reputacijai nustatyti sunkiau.",
    },
    pseudonym: {
      badge: "Slapyvardis / prekybinis vardas",
      detail: "Nėra aiškaus vardo ir pavardės kaip fizinio asmens — atsakomybė dažnai ribota.",
    },
    noSerp: {
      badge: "Lektoriaus web paieška",
      detail: "Serper nebuvo paleistas arba pilname režime nebuvo užklausos — fono patikros nėra.",
    },
    noHits: {
      badge: "Ribotas viešas pėdsakas",
      detail: "Pagal užklausą organinių rezultatų mažai arba jų nerasta — atsargiai vertinkite autoritetą.",
    },
    negativeSignals: {
      badge: "Įspėjimai paieškoje",
      detail:
        "Rezultatuose pasitaiko įspėjančių žodžių (pvz., scam, complaint) — patikrinkite šaltinius patys.",
    },
    strongPublic: {
      badge: "Viešas profesinis pėdsakas",
      detail:
        "Rasta nuorodų į profesinį kontekstą (pvz., LinkedIn, GitHub, oficialūs šaltiniai) — heuristika, neįrodymas.",
    },
    mixed: {
      badge: "Mišrus / neaiškus signalas",
      detail: "Rezultatai nevienareikšmiai — peržiūrėkite nuorodas ir patvirtinkite patys.",
    },
  },
  trustSummary: {
    title: "Pasitikėjimo suvestinė",
    prefix: "Santrauka:",
    verdict: {
      SCAM: "skeptikas laiko tai tikėtina apgaule",
      RIZIKA: "skeptikas mato padidėjusią riziką",
      ATSARGIAI: "reikia atsargumo",
      SAUGU: "signalai santykinai palankesni",
    },
    techWeak: "techninis Lighthouse pagrindas silpnesnis",
    techGood: "techninis Lighthouse pagrindas neblogas",
    instructor: {
      anonymous: "lektorius anoniminis arba neįvardytas",
      pseudonym: "lektorius pristatytas slapyvardžiu",
      named_real: "lektorius įvardytas kaip konkretus asmuo",
      unclear: "lektoriaus tapatybė neaiški",
      none: "lektoriaus tapatybė neįvertinta",
    },
    valueIndex: "vertės indeksas {n}/100",
    qualityIndex: "kokybės indeksas {n}/100",
  },
  legalDisclaimer: {
    heading: "Atsakomybės ribojimas:",
    body:
      "Ši analizė sugeneruota dirbtiniu intelektu, remiantis viešai matoma informacija puslapyje. Rezultatai yra tik informacinio pobūdžio ir neturėtų būti laikomi teisine, finansine ar investicine konsultacija. Mes neprisiimame atsakomybės už sprendimus, priimtus remiantis šiuo įrankiu. Prieš įsigydami kursus ar paslaugas visada atlikite savarankišką patikrą.",
  },
  expertVerdict: {
    title: "Eksperto išvada",
    description:
      "Pirmiausia – skeptiko sluoksnis (kaina, rizika, raudonos vėliavos); žemiau – papildomas rinkos kontekstas.",
    skepticLayer: "Skeptiko sluoksnis",
    skepticHint: "Vertė už pinigus ir pažadų tikroviškumas – ne techninis SEO.",
    priceAssessment: "Kainos vertinimas",
    contentQuality: "Turinio kokybė",
    instructorAuthority: "Lektoriaus autoritetas (AI)",
    redFlags: "Raudonos vėliavos",
    skepticRecommendation: "Skeptiko rekomendacija",
    marketContext: "Rinkos kontekstas",
    marketContextHint:
      "Palyginimas su nemokamais šaltiniais ir bendras rinkos tonas – papildo, bet ne pakeičia skeptiko verdikto.",
  },
  marketVerdict: {
    title: "Rinkos verdiktas",
  },
  freeAlternatives: {
    titleFull: "Rinkos kontekstas ir alternatyvos (Serper)",
    titleDefault: "Nemokamos alternatyvos (Google / Serper)",
    descFull:
      "Pilnas režimas (ATSARGIAI / SAUGU): YouTube, atsiliepimų / konkurentų kontekstas ir nemokamos alternatyvos. Tikri top rezultatai – patikrinkite patys.",
    descRisk:
      "Rizikos / taupymo režimas: tik YouTube ir dokumentacija – saugus išėjimo kelias; be plačios rinkos paieškos.",
    topicsLabel: "Temos:",
    noResults: "Rezultatų nerasta arba klaida.",
  },
  overall: {
    title: "Bendras įspūdis",
    qualityIndex: "Kokybės indeksas",
    qualityIndexHint: "0–100 (suvestinis)",
    valueIndex: "Vertės indeksas",
    valueIndexHint: "žinios / kaina / struktūra",
    performance: "Našumas",
    seo: "SEO",
    accessibility: "Prieiga",
    assessmentOpenAi:
      "Vertinimas: pilnas AI auditas (programa, kaina, lektorius, raudonos vėliavos)",
    assessmentFallback:
      "Ribotas režimas: AI nepasiekiamas — tik Lighthouse/meta. Pakartokite su veikiančiu OPENAI_API_KEY.",
    htmlText: "HTML tekstas:",
    htmlChars: "~{n} simb.",
    htmlTruncated: "(apkarpyta AI limitui)",
  },
  criteria: {
    title: "Mokymų puslapio kriterijai",
    defaultDesc: "Pillarų komentarai po skenavimo.",
    uniqueKnowledge: "Žinių unikalumas",
    structureValue: "Struktūros vertė",
    priceQuality: "Kaina / kokybė",
    extractedTitle: "Ištraukta iš puslapio (AI)",
    price: "Kaina",
    program: "Programa",
    outcomes: "Pažadai / rezultatai",
    noPrice: "Nerasta aiškios kainos",
    priceInsightTitle: "AI įžvalga apie kainą",
    metaTitle: "Title / description",
    keywordsLabel: "Raktažodžiai:",
    quickCheck: "Greita kontrolė",
    noteTitle: "Pastaba",
    noteBefore:
      "Verdiktas remiasi matomu tekstu ir bendra žinių baze — ne realiu pirkimu ar platformos įrašais. Video kokybę ar sertifikatą vertinkite atskirai. Norite pagalbos su SEO ar landings —",
    noteContact: "susisiekite",
    noteAfter: ".",
    generatorCta: "Generuoti SEO tekstą pagal šį turinį",
    generatorTopicDefault: "Kursų pasiūla",
    generatorTopicSuffix: ": SEO straipsnis pagal kursų turinį ir kainą",
  },
  priceInsight: {
    noPrice:
      "Kaina tekste neidentifikuota — rekomenduojama aiškiai pateikti kainodarą ir pasiūlos lygį.",
    raisePrice:
      "Rekomenduojama kelti kainą dėl didelio modulių skaičiaus, jei aiškiai parodyta praktinė vertė ir rezultatai.",
    marketAverage: "Atitinka rinkos vidurkį pagal pateiktą turinį ir vertės signalus.",
    highPrice: "Kaina gali būti aukšta pagal dabartinį turinio aiškumą — verta stiprinti pažadų konkretumą.",
    default: "Kaina atrodo pagrįsta, bet galutiniam sprendimui svarbu palyginti su 2–3 alternatyvomis.",
  },
} as const;

export const courseReportEn = {
  verdictBadge: {
    SAUGU: "Skeptic verdict: safe",
    ATSARGIAI: "Skeptic verdict: caution",
    RIZIKA: "Skeptic verdict: risk",
    SCAM: "Skeptic verdict: likely scam",
  },
  verdictRec: {
    search_free: "Try free sources first",
    consider: "Worth considering",
    likely_fair: "Price may be fair",
    unclear: "Unclear / not enough data",
  },
  instructorBadge: {
    anonymous: "Anonymous",
    pseudonym: "Pseudonym",
    named_real: "Named",
    unclear: "Unclear",
    instructorLabel: "Instructor:",
    identityTitle: "Instructor identity: {presence}",
  },
  instructorTrust: {
    sectionTitle: "Instructor check",
    identityLabel: "Identity:",
    credentialsLabel: "Credentials / hints in text:",
    serperPrefix: "Serper:",
    anonymous: {
      badge: "Anonymous instructor",
      detail:
        "No specific person named or identity is hidden — harder to assess claims and reputation.",
    },
    pseudonym: {
      badge: "Pseudonym / brand name",
      detail: "No clear real name as an individual — accountability is often limited.",
    },
    noSerp: {
      badge: "Instructor web search",
      detail: "Serper was not run or no query in full mode — no background check.",
    },
    noHits: {
      badge: "Limited public footprint",
      detail: "Few or no organic results for the query — assess authority carefully.",
    },
    negativeSignals: {
      badge: "Search warnings",
      detail:
        "Results include warning terms (e.g. scam, complaint) — verify sources yourself.",
    },
    strongPublic: {
      badge: "Public professional footprint",
      detail:
        "Links to professional context found (e.g. LinkedIn, GitHub, official sources) — heuristic, not proof.",
    },
    mixed: {
      badge: "Mixed / unclear signal",
      detail: "Results are ambiguous — review links and confirm yourself.",
    },
  },
  trustSummary: {
    title: "Trust summary",
    prefix: "Summary:",
    verdict: {
      SCAM: "skeptic considers this a likely scam",
      RIZIKA: "skeptic sees elevated risk",
      ATSARGIAI: "caution advised",
      SAUGU: "signals are relatively favourable",
    },
    techWeak: "technical Lighthouse baseline is weaker",
    techGood: "technical Lighthouse baseline is decent",
    instructor: {
      anonymous: "instructor is anonymous or unnamed",
      pseudonym: "instructor presented under a pseudonym",
      named_real: "instructor named as a specific person",
      unclear: "instructor identity is unclear",
      none: "instructor identity not assessed",
    },
    valueIndex: "value index {n}/100",
    qualityIndex: "quality index {n}/100",
  },
  legalDisclaimer: {
    heading: "Disclaimer:",
    body:
      "This analysis was generated by AI from publicly visible page information. Results are informational only and should not be treated as legal, financial or investment advice. We are not responsible for decisions made using this tool. Always do your own due diligence before buying courses or services.",
  },
  expertVerdict: {
    title: "Expert verdict",
    description:
      "Skeptic layer first (price, risk, red flags); market context below as supplementary.",
    skepticLayer: "Skeptic layer",
    skepticHint: "Value for money and promise realism — not technical SEO.",
    priceAssessment: "Price assessment",
    contentQuality: "Content quality",
    instructorAuthority: "Instructor authority (AI)",
    redFlags: "Red flags",
    skepticRecommendation: "Skeptic recommendation",
    marketContext: "Market context",
    marketContextHint:
      "Comparison with free sources and overall market tone — supplements but does not replace the skeptic verdict.",
  },
  marketVerdict: {
    title: "Market verdict",
  },
  freeAlternatives: {
    titleFull: "Market context & alternatives (Serper)",
    titleDefault: "Free alternatives (Google / Serper)",
    descFull:
      "Full mode (CAUTION / SAFE): YouTube, reviews / competitor context and free alternatives. Top results are real — verify yourself.",
    descRisk:
      "Risk / savings mode: YouTube and docs only — safe exit path; no broad market search.",
    topicsLabel: "Topics:",
    noResults: "No results found or an error occurred.",
  },
  overall: {
    title: "Overall impression",
    qualityIndex: "Quality index",
    qualityIndexHint: "0–100 (composite)",
    valueIndex: "Value index",
    valueIndexHint: "knowledge / price / structure",
    performance: "Performance",
    seo: "SEO",
    accessibility: "Accessibility",
    assessmentOpenAi:
      "Assessment: full AI audit (curriculum, pricing, instructor, red flags)",
    assessmentFallback:
      "Limited mode: AI unavailable — Lighthouse/meta only. Retry with a working OPENAI_API_KEY.",
    htmlText: "HTML text:",
    htmlChars: "~{n} chars",
    htmlTruncated: "(truncated for AI limit)",
  },
  criteria: {
    title: "Training page criteria",
    defaultDesc: "Pillar comments after scan.",
    uniqueKnowledge: "Knowledge uniqueness",
    structureValue: "Structure value",
    priceQuality: "Price / quality",
    extractedTitle: "Extracted from page (AI)",
    price: "Price",
    program: "Curriculum",
    outcomes: "Promises / outcomes",
    noPrice: "No clear price found",
    priceInsightTitle: "AI price insight",
    metaTitle: "Title / description",
    keywordsLabel: "Keywords:",
    quickCheck: "Quick check",
    noteTitle: "Note",
    noteBefore:
      "The verdict is based on visible text and general knowledge — not a real purchase or platform records. Assess video quality or certificates separately. Need help with SEO or landing pages —",
    noteContact: "get in touch",
    noteAfter: ".",
    generatorCta: "Generate SEO copy from this content",
    generatorTopicDefault: "Course offer",
    generatorTopicSuffix: ": SEO article from course content and price",
  },
  priceInsight: {
    noPrice:
      "Price not identified in text — recommend stating pricing and offer tier clearly.",
    raisePrice:
      "Consider raising price given many modules, if practical value and outcomes are clearly shown.",
    marketAverage: "Aligns with market average given content and value signals.",
    highPrice: "Price may be high for current content clarity — strengthen promise specificity.",
    default: "Price seems reasonable, but compare with 2–3 alternatives before deciding.",
  },
} as const;

export type CourseReportLabels = typeof courseReportLt;
