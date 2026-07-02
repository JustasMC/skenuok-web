type CookieRow = {
  name: string;
  purpose: string;
  duration: string;
  type: "Būtinas" | "Analitika" | "Funkcinis";
};

const rows: CookieRow[] = [
  {
    name: "authjs.session-token / __Secure-authjs.session-token",
    purpose: "Prisijungimo sesija (NextAuth) — būtina paskyros funkcijoms.",
    duration: "Sesija / iki 30 d.",
    type: "Būtinas",
  },
  {
    name: "gen_session",
    purpose: "Anoniminė SEO generatoriaus sesija ir kreditų sekimas be paskyros.",
    duration: "Iki 30 d.",
    type: "Funkcinis",
  },
  {
    name: "_ga, _ga_*",
    purpose: "Google Analytics 4 — anoniminė lankytojų statistika (tik su sutikimu).",
    duration: "Iki 2 m.",
    type: "Analitika",
  },
  {
    name: "skenuok_cookie_consent",
    purpose: "Jūsų slapukų pasirinkimo įrašymas (localStorage).",
    duration: "Iki 12 mėn.",
    type: "Būtinas",
  },
];

const typeStyles: Record<CookieRow["type"], string> = {
  Būtinas: "bg-[color-mix(in_oklab,var(--color-electric)_18%,transparent)] text-[var(--color-electric)]",
  Analitika: "bg-[color-mix(in_oklab,var(--color-lime)_14%,transparent)] text-[var(--color-lime)]",
  Funkcinis: "bg-white/8 text-zinc-200",
};

export function CookieTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]/80">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_90%,black)]">
            <th scope="col" className="px-4 py-3 font-semibold text-zinc-200">
              Pavadinimas
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-zinc-200">
              Paskirtis
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-zinc-200">
              Trukmė
            </th>
            <th scope="col" className="px-4 py-3 font-semibold text-zinc-200">
              Tipas
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]/60">
          {rows.map((row) => (
            <tr key={row.name} className="bg-[color-mix(in_oklab,var(--color-surface)_40%,transparent)]">
              <td className="px-4 py-3 font-mono text-xs text-zinc-300">{row.name}</td>
              <td className="px-4 py-3 text-zinc-400">{row.purpose}</td>
              <td className="whitespace-nowrap px-4 py-3 text-zinc-400">{row.duration}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${typeStyles[row.type]}`}>
                  {row.type}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
