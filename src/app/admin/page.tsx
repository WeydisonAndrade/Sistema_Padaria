/**
 * Página raiz do admin (/admin).
 * Redireciona automaticamente para o dashboard.
 */

import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/dashboard");
}
