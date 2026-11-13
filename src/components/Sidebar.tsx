import React from 'react';
import {
  Building2,
  FileCode2,
  FileSignature,
  LayoutDashboard,
  UserCheck,
  X,
} from 'lucide-react';
import { SectionId } from '../types/dashboard';

interface SidebarProps {
  activeSection: SectionId;
  onSelectSection: (section: SectionId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  pendingCodingCount: number;
  pendingContractsCount: number;
}

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
  pendingCodingCount,
  pendingContractsCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clinics', label: 'Clinics', icon: Building2 },
    {
      id: 'billing',
      label: 'Billing & Coding',
      icon: FileCode2,
      count: pendingCodingCount,
    },
    { id: 'onboarding', label: 'NP Onboarding', icon: UserCheck },
    {
      id: 'contracts',
      label: 'Payer Contracts',
      icon: FileSignature,
      count: pendingContractsCount,
    },
  ];

  const handleNavClick = (id: SectionId) => {
    onSelectSection(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0F2040] text-slate-100">
      {/* Brand Lockup */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <button
          type="button"
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] rounded-lg"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="32" height="32" rx="8" fill="#0D9488" />
            <path
              d="M9.5 10.5H14.5C17.8137 10.5 20.5 13.1863 20.5 16.5C20.5 19.8137 17.8137 22.5 14.5 22.5H9.5V10.5Z"
              stroke="white"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <circle cx="22" cy="11.5" r="2.2" fill="#99F6E4" />
          </svg>
          <div className="leading-tight">
            <span className="block text-[17px] font-semibold tracking-tight text-white">
              Duet
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Clinic Operations
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3 py-5">
        <p className="px-3 pb-2 text-[11px] font-medium text-slate-400">
          Management
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D9488] ${
                isActive
                  ? 'bg-[#0D9488] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3 whitespace-nowrap">
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </span>
              {typeof item.count === 'number' && item.count > 0 && (
                <span
                  className={`tabular-nums text-xs font-semibold ${
                    isActive ? 'text-teal-100' : 'text-amber-300'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Workspace Operator Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0D9488]/25 text-xs font-semibold text-teal-200">
            CO
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white">
              Clinic Owner & Ops
            </p>
            <p className="truncate text-[11px] text-slate-400">
              Multi-State Network · 8 Clinics
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-[#0F2040]/50 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
