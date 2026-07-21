export type NavLink = { href: string; label: string };

export type NavDict = {
  tools: string;
  scanners: string;
  otherTools: string;
  moreServices: string;
  b2bServices: string;
  utilities: string;
  webBuild: string;
  itServices: string;
  tradingBots: string;
  pricing: string;
  blog: string;
  contact: string;
  urlScanner: string;
  courseScanner: string;
  seoGenerator: string;
  scanWeb: string;
  scanCrypto: string;
  scanAuto: string;
  scanBeauty: string;
  scanHome: string;
  scanTech: string;
  scanSignals: string;
  services: string;
  packages: string;
  cases: string;
  faq: string;
  roi: string;
  challenge: string;
  inquiry: string;
  more: string;
  openMenu: string;
  closeMenu: string;
};

/**
 * Header IA:
 * 1) AI scanners  2) Other tools & generators  3) More / services
 */
export function buildNavGroups(nav: NavDict) {
  const scanners: NavLink[] = [
    { href: "/scan/web", label: nav.scanWeb },
    { href: "/scan/crypto", label: nav.scanCrypto },
    { href: "/scan/auto", label: nav.scanAuto },
    { href: "/scan/beauty", label: nav.scanBeauty },
    { href: "/scan/home", label: nav.scanHome },
    { href: "/scan/tech", label: nav.scanTech },
    { href: "/scan/signals", label: nav.scanSignals },
  ];

  const otherTools: NavLink[] = [
    { href: "/irankiai/seo-generatorius", label: nav.seoGenerator },
    { href: "/#roi", label: nav.roi },
  ];

  const moreServices: NavLink[] = [
    { href: "/services/web-dev", label: nav.itServices },
    { href: "/pricing", label: nav.pricing },
    { href: "/#kontaktai", label: nav.contact },
    { href: "/#duk", label: nav.faq },
  ];

  /** Desktop primary strip (outside dropdowns) */
  const primary: NavLink[] = [
    { href: "/pricing", label: nav.pricing },
    { href: "/#kontaktai", label: nav.contact },
  ];

  return { scanners, otherTools, moreServices, primary };
}
