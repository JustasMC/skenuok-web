export const SKEPTIC_VERDICTS = ["SAUGU", "ATSARGIAI", "RIZIKA", "SCAM"] as const;
export type SkepticVerdict = (typeof SKEPTIC_VERDICTS)[number];
