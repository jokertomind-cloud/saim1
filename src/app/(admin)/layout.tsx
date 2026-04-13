import { AppShell } from "@/components/layout/app-shell";
import { AdminGuard, AuthGuard } from "@/components/layout/auth-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminGuard>
        <AppShell admin>{children}</AppShell>
      </AdminGuard>
    </AuthGuard>
  );
}
