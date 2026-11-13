import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Clinic,
  CodingQueueItem,
  QueueItemStatus,
} from '../types/dashboard';

interface BillingCodingSectionProps {
  queue: CodingQueueItem[];
  clinics: Clinic[];
  onApproveItem: (id: string) => void;
  onUpdateCodes: (id: string, cpt: string, icd: string, status: QueueItemStatus) => void;
}

export const BillingCodingSection: React.FC<BillingCodingSectionProps> = ({
  queue,
  clinics,
  onApproveItem,
  onUpdateCodes,
}) => {
  const [clinicFilter, setClinicFilter] = useState<string>('All');
  const [payerFilter, setPayerFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | QueueItemStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingId, setInspectingId] = useState<string | null>(null);
  const [editCpt, setEditCpt] = useState('');
  const [editIcd, setEditIcd] = useState('');

  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      if (clinicFilter !== 'All' && item.clinicId !== clinicFilter) {
        return false;
      }
      if (payerFilter !== 'All' && item.payer !== payerFilter) {
        return false;
      }
      if (statusFilter !== 'All' && item.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.encounterRef.toLowerCase().includes(q) ||
          item.suggestedCpt.toLowerCase().includes(q) ||
          item.suggestedIcd.toLowerCase().includes(q) ||
          item.visitType.toLowerCase().includes(q) ||
          item.providerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [queue, clinicFilter, payerFilter, statusFilter, searchQuery]);

  const inspectingItem = useMemo(
    () => queue.find((item) => item.id === inspectingId) ?? null,
    [queue, inspectingId]
  );

  const openInspector = (item: CodingQueueItem) => {
    setInspectingId(item.id);
    setEditCpt(item.suggestedCpt);
    setEditIcd(item.suggestedIcd);
  };

  const pendingCount = queue.filter((q) => q.status !== 'Approved').length;
  const approvedCount = queue.filter((q) => q.status === 'Approved').length;
  const avgTurnaround = (
    queue.reduce((sum, q) => sum + q.turnaroundHours, 0) / queue.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Billing & Coding Performance Benchmarks */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">Denial rate</p>
            <span className="text-xs font-semibold text-emerald-600">
              Target &lt;2%
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            1.6%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            First-pass clean claim rate 98.4%
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">
              Coding turnaround
            </p>
            <span className="text-xs font-semibold text-emerald-600">
              SLA &lt;24h
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {avgTurnaround}h
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Average encounter-to-submission
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">Queue awaiting review</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600 tabular-nums">
            {pendingCount}
          </p>
          <p className="mt-1 text-xs text-slate-500 tabular-nums">
            {approvedCount} encounters signed off today
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            AI code match rate
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#0D9488] tabular-nums">
            94.8%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Accepted without modifier changes
          </p>
        </div>
      </div>

      {/* Filters & Coding Queue Table */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Clinic Dropdown */}
            <select
              value={clinicFilter}
              onChange={(e) => setClinicFilter(e.target.value)}
              aria-label="Filter queue by clinic"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#0D9488] focus:outline-none"
            >
              <option value="All">All Clinics</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>

            {/* Payer Dropdown */}
            <select
              value={payerFilter}
              onChange={(e) => setPayerFilter(e.target.value)}
              aria-label="Filter queue by payer"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-[#0D9488] focus:outline-none"
            >
              <option value="All">All Payers</option>
              <option value="Anthem">Anthem</option>
              <option value="Cigna">Cigna</option>
              <option value="Centene">Centene</option>
              <option value="Molina">Molina</option>
            </select>

            {/* Status Segmented Filter */}
            <div
              role="group"
              aria-label="Filter queue by status"
              className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"
            >
              {(['All', 'Needs Review', 'Flagged', 'Approved'] as const).map(
                (st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full lg:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search encounter or CPT..."
              aria-label="Search coding queue"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Coding Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Encounter</th>
                <th className="px-4 py-3.5">Clinic &amp; Payer</th>
                <th className="px-4 py-3.5">AI-suggested codes</th>
                <th className="px-4 py-3.5 text-right">Est. claim</th>
                <th className="px-4 py-3.5 text-right">Turnaround</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No encounters match the current filters
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setClinicFilter('All');
                        setPayerFilter('All');
                        setStatusFilter('All');
                        setSearchQuery('');
                      }}
                      className="mt-2 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E]"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="py-3.5 pl-6 pr-4">
                      <p className="font-mono text-xs font-semibold text-slate-900">
                        {item.encounterRef}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.visitType} · {item.providerName}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-medium text-slate-900">
                        {item.clinicName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.payer} · {item.serviceDate}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#0D9488]" />
                        <span>CPT {item.suggestedCpt}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-normal text-slate-700">
                          {item.suggestedIcd}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 tabular-nums">
                        {item.aiConfidence}% confidence
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                      ${item.amount}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                      {item.turnaroundHours.toFixed(1)}h
                    </td>
                    <td className="px-4 py-3.5">
                      {item.status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>Approved</span>
                        </span>
                      ) : item.status === 'Flagged' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Needs Review</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 pr-6 text-right">
                      <div className="inline-flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => openInspector(item)}
                          className="text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
                        >
                          Edit
                        </button>
                        {item.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => onApproveItem(item.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0D9488] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F766E] whitespace-nowrap"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Inspection & Override Drawer */}
      {inspectingItem && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Inspect ${inspectingItem.encounterRef}`}
        >
          <div
            className="fixed inset-0 bg-[#0F2040]/30 backdrop-blur-[1px]"
            onClick={() => setInspectingId(null)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="font-mono text-xs font-semibold text-[#0D9488]">
                  {inspectingItem.encounterRef}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {inspectingItem.visitType}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {inspectingItem.clinicName} · {inspectingItem.payer} ·{' '}
                  {inspectingItem.providerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingId(null)}
                aria-label="Close code editor"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                    <Sparkles className="h-3.5 w-3.5 text-[#0D9488]" />
                    <span>AI Coding Rationale</span>
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#0D9488] tabular-nums">
                    {inspectingItem.aiConfidence}% match
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {inspectingItem.rationale}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="cpt-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    CPT / HCPCS Code(s)
                  </label>
                  <input
                    id="cpt-input"
                    type="text"
                    value={editCpt}
                    onChange={(e) => setEditCpt(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-[#0D9488] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="icd-input"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    ICD-10-CM Diagnosis Code(s)
                  </label>
                  <input
                    id="icd-input"
                    type="text"
                    value={editIcd}
                    onChange={(e) => setEditIcd(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm text-slate-900 focus:border-[#0D9488] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 p-6">
              <button
                type="button"
                onClick={() => {
                  onUpdateCodes(
                    inspectingItem.id,
                    editCpt.trim() || inspectingItem.suggestedCpt,
                    editIcd.trim() || inspectingItem.suggestedIcd,
                    'Flagged'
                  );
                  setInspectingId(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
              >
                Flag for Query
              </button>
              <button
                type="button"
                onClick={() => {
                  onUpdateCodes(
                    inspectingItem.id,
                    editCpt.trim() || inspectingItem.suggestedCpt,
                    editIcd.trim() || inspectingItem.suggestedIcd,
                    'Approved'
                  );
                  setInspectingId(null);
                }}
                className="flex-1 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F766E]"
              >
                Save &amp; Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
