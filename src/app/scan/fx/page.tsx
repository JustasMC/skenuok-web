import type { Metadata } from "next";
import {
  MarketScanPageShell,
  marketPageMetadata,
} from "@/components/tools/MarketScanPageShell";
import { getRequestDictionary } from "@/lib/i18n/server";

const PATH = "/scan/fx";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const m = dict.markets.categories.fx;
  return marketPageMetadata("fx", PATH, m.title, m.description, locale);
}

export default async function FxScanPage() {
  return <MarketScanPageShell category="fx" path={PATH} />;
}
