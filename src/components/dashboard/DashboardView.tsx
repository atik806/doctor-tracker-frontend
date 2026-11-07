"use client";

import dynamic from "next/dynamic";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Activity, CircleAlert, Stethoscope, UsersRound } from "lucide-react";
import type { StatsRange } from "@/types";
import { getStats } from "@/lib/api";
import { formatNumber, percentChange } from "@/lib/format";
import { useCurrentUser, useUrlFilters } from "@/lib/hooks";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChartCard } from "./ChartCard";
import { conditionInsight, doctorInsight, specializationInsight, trendInsight } from "./insights";
import { RangePicker, rangeDescription } from "./RangePicker";
import { StatCard } from "./StatCard";

// Charts are loaded separately so their code isn't part of the first page load.
const chartLoading = () => <Skeleton className="h-64 w-full rounded-lg" />;
const PatientsTrendChart = dynamic(() => import("./charts/PatientsTrendChart"), { ssr: false, loading: chartLoading });
const PatientsPerDoctorChart = dynamic(() => import("./charts/PatientsPerDoctorChart"), { ssr: false, loading: chartLoading });
const ConditionChart = dynamic(() => import("./charts/ConditionChart"), { ssr: false, loading: chartLoading });
const SpecializationChart = dynamic(() => import("./charts/SpecializationChart"), { ssr: false, loading: chartLoading });

function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardView() {
  const { user } = useCurrentUser();
  const { filters, updateFilters } = useUrlFilters({ range: "30d" });
  const range = filters.range as StatsRange;

  const statsQuery = useQuery({
    queryKey: ["stats", range],
    queryFn: () => getStats(range),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const firstName = user ? user.name.split(" ")[0] : "";
  const period = rangeDescription(range);

  function renderContent() {
    if (statsQuery.isPending) return <DashboardSkeleton />;
    if (statsQuery.isError) {
      return <Card><ErrorState error={statsQuery.error} onRetry={() => statsQuery.refetch()} /></Card>;
    }

    const stats = statsQuery.data;
    const criticalShare = stats.totalPatients === 0 ? 0 : Math.round((stats.criticalPatients / stats.totalPatients) * 100);
    const avgPerDoctor = stats.totalDoctors === 0 ? 0 : (stats.totalPatients / stats.totalDoctors).toFixed(1);
    const change = range === "all" ? null : percentChange(stats.newPatients, stats.previousNewPatients);

    return (
      <div className={statsQuery.isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total doctors" value={stats.totalDoctors} icon={Stethoscope}
            note={range === "all" ? "All doctors on record" : `+${stats.newDoctors} joined in ${period}`} />
          <StatCard label="Total patients" value={stats.totalPatients} icon={UsersRound}
            note={`${avgPerDoctor} patients per doctor on average`} />
          <StatCard label="New patients" value={stats.newPatients} icon={Activity} change={change}
            note={range === "all" ? "All admissions on record" : `Admitted in ${period}`} />
          <StatCard label="Critical patients" value={stats.criticalPatients} icon={CircleAlert} tone="danger"
            note={`${criticalShare}% of all patients need close care`} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ChartCard className="lg:col-span-2" title="Admissions over time" insight={trendInsight(stats, range)}>
            <PatientsTrendChart data={stats.trend} />
          </ChartCard>
          <ChartCard title="Patients by condition" insight={conditionInsight(stats)}>
            <ConditionChart data={stats.byCondition} />
          </ChartCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Patients per doctor" insight={`${doctorInsight(stats)} Top 10 shown; click a bar to open.`}>
            <PatientsPerDoctorChart data={stats.patientsPerDoctor} />
          </ChartCard>
          <ChartCard title="Specializations" insight={specializationInsight(stats)}>
            <SpecializationChart data={stats.bySpecialization} />
          </ChartCard>
        </div>

        <p className="mt-6 text-center text-xs text-subtle">
          Showing {formatNumber(stats.newPatients)} admissions from {period}.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={firstName ? `${greeting()}, ${firstName}` : "Dashboard"}
        description="Here's how your clinic is doing."
        actions={<RangePicker value={range} onChange={(value) => updateFilters({ range: value })} />}
      />
      {renderContent()}
    </>
  );
}
