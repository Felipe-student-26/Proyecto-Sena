// Pie de créditos — proyecto SENA (etapa práctica).
// Datos en lib/quorumCreditos.ts; variantes auth | dashboard.

import { authClasses } from "../auth/authClasses";
import { QUORUM_CREDIT_LINE } from "../../lib/quorumCreditos";

interface AppCreditFooterProps {
  variant: "auth" | "dashboard";
}

export default function AppCreditFooter({ variant }: AppCreditFooterProps) {
  if (variant === "auth") {
    return (
      <footer
        className={`${authClasses.footer} max-w-full leading-snug`}
        aria-label="Créditos del proyecto"
      >
        {QUORUM_CREDIT_LINE}
      </footer>
    );
  }

  return (
    <footer
      className="shrink-0 border-t border-borderSubtle bg-surface/80 px-4 py-2 text-center text-xs leading-snug text-muted dark:border-white/10 dark:bg-surface/50 dark:text-white/25"
      aria-label="Créditos del proyecto"
    >
      {QUORUM_CREDIT_LINE}
    </footer>
  );
}
