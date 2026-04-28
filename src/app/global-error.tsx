"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="lt">
      <body className="flex min-h-dvh flex-col items-center justify-center bg-[#050508] px-4 text-center text-zinc-100 antialiased">
        <h1 className="text-xl font-semibold text-white">Kritinė klaida</h1>
        <p className="mt-3 max-w-md text-sm text-zinc-300">
          Programėlė negali būti paleista. Bandykite perkrauti puslapį. Jei klaida kartojasi, patikrinkite diegimo žurnalus.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-8 rounded-xl bg-[var(--color-electric)] px-6 py-3 text-sm font-semibold text-[#041014]"
        >
          Perkrauti
        </button>
      </body>
    </html>
  );
}
