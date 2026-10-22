import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { AuthProvider } from "../contexts/AuthContext";
import { ConfirmDialogProvider } from "../lib/confirm";
import Toaster from "../components/ui/Toaster";
import { QUORUM_THEME_INIT_SCRIPT } from "../lib/quorumThemeInitScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "QUORUM — Control de Asistencia SENA CPIC",
  description:
    "Sistema digital de control de asistencia de aprendices del SENA Centro de Procesos Industriales y Construcción.",
  icons: {
    icon: "/branding/logo_quorum_solo_q.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Evita warning de hidratación cuando extensiones del navegador añaden class al <html> (p. ej. mdl-js)
    <html lang="es" suppressHydrationWarning>
      <body className={`${GeistSans.className} antialiased`}>
        <script
          id="quorum-theme-init"
          dangerouslySetInnerHTML={{ __html: QUORUM_THEME_INIT_SCRIPT }}
        />
        <AuthProvider>
          <ConfirmDialogProvider>
            {children}
            <Toaster />
          </ConfirmDialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
