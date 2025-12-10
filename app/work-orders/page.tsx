import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import WorkOrdersList from "@/components/work-orders/WorkOrdersList";

export default async function WorkOrdersPage() {
  // Get userId from session if available (optional for free version)
  const session = await auth();
  const userId = session?.userId ?? null;

  return (
    <AppShell>
      <WorkOrdersList />
    </AppShell>
  );
}
