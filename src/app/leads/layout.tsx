import { ReactNode } from "react";
import { AppShell } from "@/components/layout";

export default function LeadsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
