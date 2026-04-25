"use client";

import { useEffect, useState } from "react";

/**
 * Apatinė „paslėpta“ sritis (klaviatūra, naršyklės juostos), pagal Visual Viewport API.
 * Tinka `position: fixed` elementams pakelti virš klaviatūros.
 */
export function useVisualKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const hiddenBottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setInset(Math.round(hiddenBottom));
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
