"use client";

// Toaster global de QUORUM — envuelve Sonner con el tema del sistema

import { useEffect, useState } from "react";
import { Toaster as SonnerToaster } from "sonner";

export default function Toaster() {
  const [tema, setTema] = useState<"light" | "dark">("light");

  useEffect(() => {
    function actualizarTema() {
      setTema(document.documentElement.classList.contains("dark") ? "dark" : "light");
    }
    actualizarTema();

    const observer = new MutationObserver(actualizarTema);
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <SonnerToaster
      theme={tema}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: { fontSize: "1.2em" },
        classNames: {
          toast: "font-sans text-sm rounded-xl shadow-lg border",
          title: "font-semibold",
          description: "text-muted-foreground text-xs",
        },
      }}
    />
  );
}
