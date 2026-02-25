import { ReactNode } from "react";
import { AppShell } from "@/components/layout";

export default function SavedLeadsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
