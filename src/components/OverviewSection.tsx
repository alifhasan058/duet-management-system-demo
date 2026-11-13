import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import {
  MONTHLY_REVENUE_DATA,
  PAYER_CLAIMS_SPLIT,
} from '../data/mockData';
import {
  Clinic,
  CodingQueueItem,
  NPApplicant,
  PayerContract,
  SectionId,
} from '../types/dashboard';

interface OverviewSectionProps {
  clinics: Clinic[];
  codingQueue: CodingQueueItem[];
  applicants: NPApplicant[];
  contracts: PayerContract[];
  onNavigate: (section: SectionId) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  clinics,
  codingQueue,
  applicants,
  contracts,
  onNavigate,
}) => {
  const [timeframe, setTimeframe] = useState<'6M' | '12M'>('12M');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);
  const [selectedPayer, setSelectedPayer] = useState<string | null>(null);

  const visibleMonths =
    timeframe === '6M'
      ? MONTHLY_REVENUE_DATA.slice(-6)
      : MONTHLY_REVENUE_DATA;

  const maxRevenue = 95000;

  const activeMonthPoint =
    visibleMonths.find((m) => m.month === hoveredMonth) ??
    visibleMonths[visibleMonths.length - 1];

  const activePayerData = PAYER_CLAIMS_SPLIT.find(
    (p) => p.payer === selectedPayer
  );

  // Donut geometry
  const radius = 64;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  const donutSegments = PAYER_CLAIMS_SPLIT.reduce<
    Array<{
      payer: string;
      percentage: number;
      claimsCount: number;
      amount: number;
      paidRate: number;
      color: string;
      dashArray: string;
      dashOffset: number;
    }>
  >((acc, item) => {
    const previousPercent = acc.reduce((sum, s) => sum + s.percentage, 0);
    const segmentLength = (item.percentage / 100) * circumference;
    const gap = 3;
    const dashArray = `${Math.max(segmentLength - gap, 0)} ${
      circumference - Math.max(segmentLength - gap, 0)
    }`;
    const dashOffset = -(previousPercent / 100) * circumference;
    acc.push({
      ...item,
      dashArray,
      dashOffset,
    });
    return acc;
  }, []);

  const totalContractsActive = contracts.length;
  const renewalDueCount = contracts.filter(
    (c) => c.status === 'Renewal Due'
  ).length;
  const pendingClinicsCount = clinics.filter(
    (c) => c.credentialingStatus === 'Pending'
  ).length;
  const flaggedCodingCount = codingQueue.filter(
    (q) => q.status === 'Flagged' || q.status === 'Needs Review'
  ).length;
  const goLiveReadyCount = applicants.filter(
    (a) => a.currentStep === 'Go live'
  ).length;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* KPI 1 */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Monthly revenue
              </p>
              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-600 tabular-nums">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +8.4%
              </span>
            </div>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              $84,500
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Nov 2026 · Up from $81,600 in Oct
            </p>
          </div>

          {/* KPI 2 */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">Claims paid</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                On target
              </span>
            </div>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              94%
            </p>
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums">
              1,184 of 1,260 submitted claims settled
            </p>
          </div>

          {/* KPI 3 */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Patients re-engaged
              </p>
              <span className="text-xs font-semibold text-[#0D9488] tabular-nums">
                +14% MoM
              </span>
            </div>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              312
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Returned to care across 8 clinics
            </p>
          </div>

          {/* KPI 4 */}
          <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">
                Payer contracts
              </p>
              {renewalDueCount > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {renewalDueCount} renewal due
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600">
                  All current
                </span>
              )}
            </div>
            <p className="mt-2.5 text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
              {totalContractsActive} active
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              Commercial, Exchange &amp; Medicaid panels
            </p>
          </div>
        </div>
      </section>

      {/* Charts Row */}
      <section
        aria-label="Revenue and payer analytics"
        className="grid grid-cols-1 gap-6 lg:grid-cols-12"
      >
        {/* Revenue by Month Bar Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)] lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Revenue by month
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                {activeMonthPoint.fullMonth} ·{' '}
                <span className="font-semibold text-slate-800">
                  ${activeMonthPoint.revenue.toLocaleString()}
                </span>{' '}
                · {activeMonthPoint.claimsCount.toLocaleString()} claims (
                {activeMonthPoint.paidRate}% paid)
              </p>
            </div>

            <div
              role="group"
              aria-label="Chart timeframe"
              className="inline-flex items-center rounded-xl bg-slate-100 p-1"
            >
              <button
                type="button"
                onClick={() => setTimeframe('6M')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  timeframe === '6M'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Months
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('12M')}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  timeframe === '12M'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 Months
              </button>
            </div>
          </div>

          {/* Responsive Interactive Bar Chart */}
          <div className="mt-6">
            <div className="relative flex h-64 items-end gap-2 sm:gap-3 pt-6 pb-2">
              {/* Subtle Horizontal Gridlines */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-6 bottom-8 flex flex-col justify-between"
              >
                {['$95k', '$70k', '$45k', '$20k'].map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 border-b border-dashed border-slate-100 pb-0.5"
                  >
                    <span className="w-9 text-[10px] font-medium text-slate-400 tabular-nums">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="relative z-10 flex h-full w-full items-end gap-1.5 pl-10 sm:gap-3">
                {visibleMonths.map((item, idx) => {
                  const heightPercent = Math.round(
                    (item.revenue / maxRevenue) * 100
                  );
                  const isLast = idx === visibleMonths.length - 1;
                  const isHovered = hoveredMonth === item.month;
                  const isActive = isHovered || (!hoveredMonth && isLast);

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col items-center justify-end"
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setHoveredMonth(item.month)}
                        onMouseLeave={() => setHoveredMonth(null)}
                        onFocus={() => setHoveredMonth(item.month)}
                        onBlur={() => setHoveredMonth(null)}
                        aria-label={`${item.fullMonth}: $${item.revenue.toLocaleString()}`}
                        className="group relative flex h-full w-full flex-col items-center justify-end focus:outline-none"
                      >
                        <span
                          className={`mb-1.5 text-[10px] font-semibold tabular-nums transition-opacity duration-150 ${
                            isActive
                              ? 'opacity-100 text-[#0F2040]'
                              : 'opacity-0 group-hover:opacity-100 text-slate-600'
                          }`}
                        >
                          ${(item.revenue / 1000).toFixed(1)}k
                        </span>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[36px] rounded-t-lg transition-colors duration-150 ${
                            isActive
                              ? 'bg-[#0D9488]'
                              : 'bg-[#0F2040]/15 group-hover:bg-[#0D9488]/70'
                          }`}
                        />
                      </button>
                      <span
                        className={`mt-2 text-[11px] font-medium ${
                          isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Claims by Payer Donut Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)] lg:col-span-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Claims by payer
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Nov 2026 distribution · Click payer to inspect
              </p>
            </div>
            {selectedPayer && (
              <button
                type="button"
                onClick={() => setSelectedPayer(null)}
                className="text-xs font-medium text-[#0D9488] hover:text-[#0F766E] whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row lg:flex-col xl:flex-row">
            {/* SVG Donut */}
            <div className="relative flex h-44 w-44 shrink-0 items-center justify-center">
              <svg
                viewBox="0 0 180 180"
                className="h-44 w-44 -rotate-90"
                role="img"
                aria-label="Claims by payer donut chart"
              >
                {donutSegments.map((seg) => {
                  const isDimmed =
                    selectedPayer !== null && selectedPayer !== seg.payer;
                  return (
                    <circle
                      key={seg.payer}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth={
                        selectedPayer === seg.payer
                          ? strokeWidth + 3
                          : strokeWidth
                      }
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      strokeLinecap="butt"
                      onClick={() =>
                        setSelectedPayer(
                          selectedPayer === seg.payer ? null : seg.payer
                        )
                      }
                      className={`cursor-pointer transition-all duration-150 ${
                        isDimmed ? 'opacity-30' : 'opacity-100'
                      }`}
                    />
                  );
                })}
              </svg>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-medium text-slate-500">
                  {activePayerData ? activePayerData.payer : 'Total claims'}
                </span>
                <span className="text-xl font-semibold text-slate-900 tabular-nums">
                  {activePayerData
                    ? `${activePayerData.percentage}%`
                    : '1,260'}
                </span>
                <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                  {activePayerData
                    ? `$${activePayerData.amount.toLocaleString()}`
                    : '$84,500'}
                </span>
              </div>
            </div>

            {/* Interactive Legend */}
            <div className="w-full flex-1 space-y-2">
              {PAYER_CLAIMS_SPLIT.map((item) => {
                const isSelected = selectedPayer === item.payer;
                return (
                  <button
                    key={item.payer}
                    type="button"
                    onClick={() =>
                      setSelectedPayer(isSelected ? null : item.payer)
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-100 ring-1 ring-slate-200'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          {item.payer}
                        </p>
                        <p className="text-[11px] text-slate-500 tabular-nums">
                          {item.claimsCount} claims · {item.paidRate}% paid
                        </p>
                      </div>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="text-xs font-semibold text-slate-900">
                        {item.percentage}%
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ${item.amount.toLocaleString()}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Operational Priorities Strip */}
      <section aria-label="Operational queues requiring attention">
        <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Operational action items
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Direct routing to queues needing owner or ops review
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {flaggedCodingCount} encounters awaiting coding sign-off
                </p>
                <p className="text-xs text-slate-500">
                  Denial rate holding at 1.6% (&lt;2% target) · 18.4h average turnaround
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('billing')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] whitespace-nowrap shrink-0"
              >
                <span>Open Billing &amp; Coding</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {pendingClinicsCount} clinics in credentialing review (OH, CA)
                </p>
                <p className="text-xs text-slate-500">
                  Buckeye Medical Associates &amp; Bayside NP Clinic awaiting payer roster confirmation
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('clinics')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] whitespace-nowrap shrink-0"
              >
                <span>Review Clinics</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {goLiveReadyCount} NP applicant ready for Go live · {renewalDueCount} payer contracts approaching renewal
                </p>
                <p className="text-xs text-slate-500">
                  Centene (Dec 15) and Molina (Jan 10) fee schedules flagged for rate review
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('onboarding')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>NP Onboarding</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contracts')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] whitespace-nowrap"
                >
                  <span>Payer Contracts</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
