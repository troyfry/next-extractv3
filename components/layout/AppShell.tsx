"use client";

import React from "react";
import Link from "next/link";
import UserMenu from "@/components/auth/UserMenu";
import PlanSelector from "@/components/plan/PlanSelector";
import PlanBanner from "@/components/plan/PlanBanner";
import { useCurrentPlan } from "@/lib/plan-context";
import { isFreePlan } from "@/lib/plan-helpers";
import { isDevMode } from "@/lib/env";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { plan } = useCurrentPlan();
  const isFree = isFreePlan(plan);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-white">
              Work Order Extractor
            </h1>
            <div className="flex items-center gap-4">
              {/* Show plan banner in dev mode OR when not Free */}
              {(isDevMode || !isFree) && <PlanBanner />}
              {!isFree && (
                <span className="text-sm text-gray-400 hidden sm:block">
                  Alpha version – local data only
                </span>
              )}
              {/* Always show pricing link in dev mode */}
              {isDevMode && (
                <Link
                  href="/pricing"
                  className="px-3 py-1 bg-gray-700 text-gray-300 rounded text-xs font-medium hover:bg-gray-600 transition-colors"
                >
                  Pricing
                </Link>
              )}
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Content container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Always show plan selector in dev mode (even for Free plan) so developers can switch */}
        {isDevMode && <PlanSelector />}
        {children}
      </div>
    </div>
  );
}

