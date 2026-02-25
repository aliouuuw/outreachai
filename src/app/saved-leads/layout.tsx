import { AppShell } from "@/components/layout/AppShell";

export default function SavedLeadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
