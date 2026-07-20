"use client";

import { useDict } from "@/components/i18n/LocaleProvider";

export function DashboardPageLoading() {
  const t = useDict().dashboard;
  return (
    <div className="site-skeleton min-h-[60vh] rounded-2xl" role="status" aria-live="polite">
      {t.loading}
    </div>
  );
}

export function AgentChatPanelLoading() {
  const t = useDict().dashboard;
  return (
    <div className="site-skeleton min-h-[420px] rounded-2xl" role="status" aria-live="polite">
      {t.agentPanelLoading}
    </div>
  );
}
