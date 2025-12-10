import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import WorkOrdersList from "@/components/work-orders/WorkOrdersList";

export default async function WorkOrdersPage() {
  // Check authentication
  const session = await auth();
  if (!session || !session.userId) {
    redirect("/auth/signin");
  }

  return (
    <AppShell>
      <WorkOrdersList />
    </AppShell>
  );
}
