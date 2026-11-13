import React from 'react';
import { Download, Menu } from 'lucide-react';
import { SectionId } from '../types/dashboard';

interface HeaderProps {
  activeSection: SectionId;
  onOpenMobileMenu: () => void;
  onExportCsv: () => void;
}

const SECTION_META: Record<SectionId, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Network revenue, claims realization, and payer mix',
  },
  clinics: {
    title: 'Clinics',
    subtitle: 'Clinic performance, coding accuracy, and care retention',
  },
  billing: {
    title: 'Billing & Coding',
    subtitle: 'AI-assisted coding queue, denial monitoring, and SLA tracking',
  },
  onboarding: {
    title: 'NP Onboarding',
    subtitle: 'Applicant credentialing, payer enrollment, and launch readiness',
  },
  contracts: {
    title: 'Payer Contracts',
    subtitle: 'Active fee schedules, reimbursement benchmarks, and renewals',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onOpenMobileMenu,
  onExportCsv,
}) => {
  const meta = SECTION_META[activeSection];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Zone: Mobile Trigger + Breadcrumb */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="whitespace-nowrap font-medium text-slate-600">
                Duet
              </span>
              <span aria-hidden="true">/</span>
              <span className="truncate font-medium text-[#0D9488]">
                {meta.title}
              </span>
            </div>
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              {meta.title}
            </h1>
          </div>
        </div>

        {/* Center/Right Metadata (Desktop) + Primary Action */}
        <div className="flex shrink-0 items-center gap-4">
          <span className="hidden text-xs font-medium text-slate-500 md:inline-block whitespace-nowrap">
            Cycle: Nov 2026 · 8 Active Clinics
          </span>

          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#0F766E] active:translate-y-px whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] focus-visible:ring-offset-2"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
