/**
 * Bendras atsakomybės ribojimas AI / skenavimo įrankiams.
 */
export function LegalDisclaimer() {
  return (
    <div className="mt-8 border-t border-[var(--color-border)] pt-4 text-xs leading-relaxed text-zinc-500">
      <p>
        <span className="font-semibold not-italic text-zinc-400">Atsakomybės ribojimas: </span>
        <span className="italic">
          Ši analizė sugeneruota dirbtiniu intelektu, remiantis viešai matoma informacija puslapyje. Rezultatai yra tik
          informacinio pobūdžio ir neturėtų būti laikomi teisine, finansine ar investicine konsultacija. Mes neprisiimame
          atsakomybės už sprendimus, priimtus remiantis šiuo įrankiu. Prieš įsigydami kursus ar paslaugas visada atlikite
          savarankišką patikrą.
        </span>
      </p>
    </div>
  );
}
