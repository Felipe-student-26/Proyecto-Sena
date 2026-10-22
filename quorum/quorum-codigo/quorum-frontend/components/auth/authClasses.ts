/** Clases compartidas para páginas de autenticación (claro / oscuro). */

export const authClasses = {
  subtitle: "mt-3 text-sm text-muted dark:text-white/50 tracking-wide",
  footer: "mt-5 text-center text-xs text-muted dark:text-white/25",
  card: "overflow-hidden rounded-2xl border border-borderSubtle bg-surface/95 p-6 shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:shadow-2xl dark:shadow-black/40 dark:backdrop-blur-xl",
  cardInner: "rounded-xl border border-borderSubtle bg-surface p-6 shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:backdrop-blur-xl",
  label: "mb-1.5 block text-sm font-medium text-foreground dark:text-white/80",
  labelSm: "mb-1 block text-sm font-medium text-foreground dark:text-white/80",
  input:
    "w-full rounded-lg border border-borderSubtle bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-verde dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/30 dark:focus:border-emerald-500/50 dark:focus:ring-emerald-500/25",
  inputWithIcon: "quorum-input pl-9 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:placeholder:text-white/30",
  link: "text-sm text-verde hover:underline dark:text-emerald-400",
  linkXs: "text-xs text-verde hover:underline dark:text-emerald-400",
  btnPrimary:
    "w-full flex items-center justify-center gap-2 rounded-lg bg-verde px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-verdeOscuro active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
  iconBadge:
    "mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-verdeClaro dark:bg-verdeOscuro/35",
  heading: "text-lg font-semibold text-foreground dark:text-white",
  body: "text-sm text-muted dark:text-white/60",
  themeToggle:
    "absolute right-4 top-4 z-20 rounded-lg p-2 text-foreground/70 transition-colors hover:bg-black/5 hover:text-foreground dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/80",
} as const;
