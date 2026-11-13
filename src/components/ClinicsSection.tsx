import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Search,
  Send,
  X,
} from 'lucide-react';
import { Clinic, CredentialingStatus } from '../types/dashboard';

interface ClinicsSectionProps {
  clinics: Clinic[];
  onTriggerOutreach: (clinicId: string) => void;
  onApproveCredentialing: (clinicId: string) => void;
}

type SortKey = 'monthlyRevenue' | 'codingAccuracy' | 'patientsLostToCare';

export const ClinicsSection: React.FC<ClinicsSectionProps> = ({
  clinics,
  onTriggerOutreach,
  onApproveCredentialing,
}) => {
  const [selectedState, setSelectedState] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | CredentialingStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('monthlyRevenue');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);

  const states = useMemo(() => {
    const unique = Array.from(new Set(clinics.map((c) => c.state))).sort();
    return ['All', ...unique];
  }, [clinics]);

  const filteredClinics = useMemo(() => {
    return clinics
      .filter((clinic) => {
        if (selectedState !== 'All' && clinic.state !== selectedState) {
          return false;
        }
        if (
          statusFilter !== 'All' &&
          clinic.credentialingStatus !== statusFilter
        ) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            clinic.name.toLowerCase().includes(q) ||
            clinic.city.toLowerCase().includes(q) ||
            clinic.state.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const diff = a[sortKey] - b[sortKey];
        return sortAsc ? diff : -diff;
      });
  }, [clinics, selectedState, statusFilter, searchQuery, sortKey, sortAsc]);

  const selectedClinic = useMemo(
    () => clinics.find((c) => c.id === selectedClinicId) ?? null,
    [clinics, selectedClinicId]
  );

  const totalRevenue = filteredClinics.reduce(
    (sum, c) => sum + c.monthlyRevenue,
    0
  );
  const totalLost = filteredClinics.reduce(
    (sum, c) => sum + c.patientsLostToCare,
    0
  );
  const avgAccuracy =
    filteredClinics.length > 0
      ? (
          filteredClinics.reduce((sum, c) => sum + c.codingAccuracy, 0) /
          filteredClinics.length
        ).toFixed(1)
      : '0.0';

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtered Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            Filtered monthly revenue
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {filteredClinics.length} of {clinics.length} clinics shown
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            Avg coding accuracy
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 tabular-nums">
            {avgAccuracy}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Target benchmark ≥ 96.0%
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            Patients lost to care
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-600 tabular-nums">
            {totalLost}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Eligible for automated recall outreach
          </p>
        </div>
      </div>

      {/* Filter Bar + Table Card */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          {/* State Filter Segmented Control */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">
              State:
            </span>
            <div
              role="group"
              aria-label="Filter clinics by state"
              className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1"
            >
              {states.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedState(st)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedState === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Search + Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-56 sm:flex-initial">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clinic or city..."
                aria-label="Search clinics"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'All' | CredentialingStatus)
              }
              aria-label="Filter by credentialing status"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#0D9488] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Clinic</th>
                <th className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('monthlyRevenue')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 whitespace-nowrap"
                  >
                    <span>Monthly revenue</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('codingAccuracy')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 whitespace-nowrap"
                  >
                    <span>Coding accuracy</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3.5">Credentialing</th>
                <th className="px-4 py-3.5 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('patientsLostToCare')}
                    className="inline-flex items-center gap-1 hover:text-slate-900 whitespace-nowrap"
                  >
                    <span>Patients lost to care</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="py-3.5 pl-4 pr-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No clinics match the active filters
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedState('All');
                        setStatusFilter('All');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E]"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredClinics.map((clinic) => {
                  const isActive = clinic.credentialingStatus === 'Active';
                  return (
                    <tr
                      key={clinic.id}
                      onClick={() => setSelectedClinicId(clinic.id)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 pl-6 pr-4">
                        <p className="font-medium text-slate-900">
                          {clinic.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {clinic.city}, {clinic.state} · {clinic.activeNPs} NPs
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        ${clinic.monthlyRevenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            clinic.codingAccuracy >= 96
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {clinic.codingAccuracy.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            isActive ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                          )}
                          <span>{clinic.credentialingStatus}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums">
                        <span
                          className={`font-mono text-xs font-semibold ${
                            clinic.patientsLostToCare >= 35
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {clinic.patientsLostToCare}
                        </span>
                        {clinic.outreachActive && (
                          <span className="ml-2 text-[11px] font-medium text-[#0D9488]">
                            Recall active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClinicId(clinic.id);
                          }}
                          className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] whitespace-nowrap"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinic Detail Slide-Over Drawer */}
      {selectedClinic && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedClinic.name} details`}
        >
          <div
            className="fixed inset-0 bg-[#0F2040]/30 backdrop-blur-[1px]"
            onClick={() => setSelectedClinicId(null)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-medium text-[#0D9488]">
                  {selectedClinic.city}, {selectedClinic.state}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedClinic.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Last audit: {selectedClinic.lastAuditDate} · Primary payer:{' '}
                  {selectedClinic.primaryPayer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedClinicId(null)}
                aria-label="Close clinic drawer"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Monthly revenue</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900 tabular-nums">
                    ${selectedClinic.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Coding accuracy</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-600 tabular-nums">
                    {selectedClinic.codingAccuracy.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Re-engaged (30d)</p>
                  <p className="mt-1 text-xl font-semibold text-[#0D9488] tabular-nums">
                    {selectedClinic.patientsReengaged}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Lost to care</p>
                  <p className="mt-1 text-xl font-semibold text-amber-600 tabular-nums">
                    {selectedClinic.patientsLostToCare}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-semibold text-slate-900">
                  Credentialing &amp; staffing
                </h4>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Credentialing status</span>
                  <span
                    className={`font-semibold ${
                      selectedClinic.credentialingStatus === 'Active'
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {selectedClinic.credentialingStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Active Nurse Practitioners</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {selectedClinic.activeNPs}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Outreach queue status</span>
                  <span className="font-semibold text-slate-900">
                    {selectedClinic.outreachActive
                      ? 'Automated SMS/Call active'
                      : 'Ready for batch trigger'}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 space-y-2.5">
              <button
                type="button"
                disabled={selectedClinic.outreachActive}
                onClick={() => onTriggerOutreach(selectedClinic.id)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F766E] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              >
                <Send className="h-3.5 w-3.5" />
                <span>
                  {selectedClinic.outreachActive
                    ? 'Recall Outreach Active'
                    : `Launch Re-engagement (${selectedClinic.patientsLostToCare} patients)`}
                </span>
              </button>

              {selectedClinic.credentialingStatus === 'Pending' && (
                <button
                  type="button"
                  onClick={() => onApproveCredentialing(selectedClinic.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Mark Credentialing Active</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
