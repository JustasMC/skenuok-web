import type { Metadata } from "next";
import {
  MarketScanPageShell,
  marketPageMetadata,
} from "@/components/tools/MarketScanPageShell";
import { getRequestDictionary } from "@/lib/i18n/server";

const PATH = "/scan/etf";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const m = dict.markets.categories.etf;
  return marketPageMetadata("etf", PATH, m.title, m.description, locale);
}

export default async function EtfScanPage() {
  return <MarketScanPageShell category="etf" path={PATH} />;
}
