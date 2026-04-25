"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";
import { type ReactNode, useEffect, useState } from "react";

/** Tas pats plotis / aukštis / pozicija kaip `ChatBot` FAB – išvengia šuolio, kai chunk užsikrauna. */
function ChatBotPlaceholder() {
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-4 z-[60] h-14 w-14 shrink-0 rounded-2xl opacity-0 sm:right-5"
      aria-hidden
    />
  );
}

const ChatBot = dynamic(() => import("@/components/ChatBot").then((m) => m.ChatBot), {
  ssr: false,
  loading: () => <ChatBotPlaceholder />,
});

/**
 * Loads the chat chunk after idle time so initial Lighthouse / TBT stays lean;
 * FAB appears shortly after first paint without blocking critical work.
 */
function DeferredChatBot() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      if (cancelled) return;
      setShow(true);
    };

    const fallbackMs = 4000;
    const timeoutId = window.setTimeout(reveal, fallbackMs);

    let idleId: number | undefined;
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(
        () => {
          window.clearTimeout(timeoutId);
          reveal();
        },
        { timeout: 3200 },
      );
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      if (idleId != null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
    };
  }, []);

  if (!show) return <ChatBotPlaceholder />;
  return <ChatBot />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <DeferredChatBot />
    </SessionProvider>
  );
}
