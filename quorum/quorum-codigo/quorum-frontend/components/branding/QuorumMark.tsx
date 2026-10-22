"use client";

import Image from "next/image";
import { quorumBrandFont } from "../../lib/quorumBrandFont";

const SRC_LOGO = "/branding/logo_quorum.png";
const SRC_WORDMARK = "/branding/wordmark_quorum.png";
const SRC_WORDMARK_DARK = "/branding/wordmark_quorum_oscuro.png";

type LogoVariant = "hero" | "compact" | "sidebar";

export type WordmarkVariant = "login" | "headbar" | "auth";

/** Tamaños del logo (hero / barra / sidebar) */
const LOGO_SIZES: Record<
  LogoVariant,
  { width: number; height: number; className: string; priority?: boolean }
> = {
  hero: {
    width: 189,
    height: 189,
    className: "mx-auto h-[189px] w-[189px] max-w-[189px] object-contain",
    priority: true,
  },
  compact: {
    width: 57,
    height: 57,
    className: "h-[57px] w-[57px] shrink-0 object-contain",
  },
  sidebar: {
    width: 63,
    height: 63,
    className: "h-[63px] w-[63px] shrink-0 object-contain",
  },
};

export function QuorumLogo({
  variant,
  priority,
}: {
  variant: LogoVariant;
  priority?: boolean;
}) {
  const cfg = LOGO_SIZES[variant];
  return (
    <Image
      src={SRC_LOGO}
      alt="Quorum"
      width={cfg.width}
      height={cfg.height}
      className={cfg.className}
      priority={priority ?? cfg.priority ?? false}
    />
  );
}

const WORDMARK_SIZES: Record<
  WordmarkVariant,
  { width: number; height: number; className: string; priority?: boolean }
> = {
  login: {
    width: 448,
    height: 134,
    className: "mx-auto h-auto w-full max-w-[336px] object-contain",
    priority: true,
  },
  headbar: {
    width: 560,
    height: 157,
    className:
      "h-[34px] w-auto max-w-[min(84vw,560px)] shrink-0 object-contain object-left sm:max-w-[616px]",
  },
  auth: {
    width: 280,
    height: 84,
    className: "mx-auto h-auto w-full max-w-[240px] object-contain",
  },
};

export function QuorumWordmark({
  variant,
  priority,
}: {
  variant: WordmarkVariant;
  priority?: boolean;
}) {
  const cfg = WORDMARK_SIZES[variant];
  const prio = priority ?? cfg.priority ?? false;
  return (
    <>
      <Image
        src={SRC_WORDMARK}
        alt="Quorum"
        width={cfg.width}
        height={cfg.height}
        className={`${cfg.className} dark:hidden`}
        priority={prio}
      />
      <Image
        src={SRC_WORDMARK_DARK}
        alt="Quorum"
        width={cfg.width}
        height={cfg.height}
        className={`${cfg.className} hidden dark:block`}
        priority={prio}
      />
    </>
  );
}

/** Clases para el texto "QUORUM" al estilo wordmark (sin imagen) */
export const quorumNombreTextoClases =
  `${quorumBrandFont.className} font-bold uppercase tracking-[0.05em] antialiased`;
