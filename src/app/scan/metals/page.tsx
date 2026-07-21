import type { Metadata } from "next";
import {
  MarketScanPageShell,
  marketPageMetadata,
} from "@/components/tools/MarketScanPageShell";
import { getRequestDictionary } from "@/lib/i18n/server";

const PATH = "/scan/metals";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const m = dict.markets.categories.metals;
  return marketPageMetadata("metals", PATH, m.title, m.description, locale);
}

export default async function MetalsScanPage() {
  return <MarketScanPageShell category="metals" path={PATH} />;
}
