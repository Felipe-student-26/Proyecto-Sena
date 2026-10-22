// Página de inicio — redirige al login
// En el módulo 1 se implementará la lógica de autenticación completa
import { redirect } from "next/navigation";

export default function Home() {
  // Por ahora redirigimos al login directamente
  redirect("/login");
}
