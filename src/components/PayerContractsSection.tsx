import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { ContractStatus, PayerContract } from '../types/dashboard';

interface PayerContractsSectionProps {
  contracts: PayerContract[];
  onRenewContract: (contractId: string) => void;
}

export const PayerContractsSection: React.FC<PayerContractsSectionProps> = ({
  contracts,
  onRenewContract,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | ContractStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      if (statusFilter !== 'All' && c.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.payerName.toLowerCase().includes(q) ||
          c.planLine.toLowerCase().includes(q) ||
          c.statesCovered.some((st) => st.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [contracts, statusFilter, searchQuery]);

  const selectedContract = useMemo(
    () => contracts.find((c) => c.id === selectedContractId) ?? null,
    [contracts, selectedContractId]
  );

  const avgRate = Math.round(
    contracts.reduce((sum, c) => sum + c.rateNumeric, 0) / contracts.length
  );
  const renewalCount = contracts.filter(
    (c) => c.status === 'Renewal Due'
  ).length;

  return (
    <div className="space-y-6">
      {/* Contract Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            Active payer agreements
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {contracts.length} active
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Covering 6 operating states
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            Average contracted rate
          </p>
          <p className="mt-2 text-2xl font-semibold text-[#0D9488] tabular-nums">
            {avgRate}% Medicare
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Weighted commercial &amp; Medicaid mix
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
          <p className="text-xs font-medium text-slate-500">
            Renewals needing action
          </p>
          <p
            className={`mt-2 text-2xl font-semibold tabular-nums ${
              renewalCount > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {renewalCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {renewalCount > 0
              ? 'Expiring within next 60 days'
              : 'All agreements renewed'}
          </p>
        </div>
      </div>

      {/* Contracts List Card */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div
            role="group"
            aria-label="Filter payer contracts by status"
            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 self-start"
          >
            {(['All', 'Active', 'Renewal Due'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payer, plan, or state..."
              aria-label="Search payer contracts"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pr-3 pl-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#0D9488] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Payer &amp; Plan Line</th>
                <th className="px-4 py-3.5">States</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Renewal date</th>
                <th className="px-4 py-3.5 text-right">Reimbursement rate</th>
                <th className="px-4 py-3.5 text-right">Avg payout</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Fee schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <p className="text-sm font-medium text-slate-700">
                      No payer contracts match your search
                    </p>
                    <button
                      type="button"
                      onClick={() => {
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
                filteredContracts.map((contract) => {
                  const isRenewal = contract.status === 'Renewal Due';
                  return (
                    <tr
                      key={contract.id}
                      onClick={() => setSelectedContractId(contract.id)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3.5 pl-6 pr-4">
                        <p className="font-medium text-slate-900">
                          {contract.payerName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {contract.planLine} · Lead: {contract.accountLead}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-600">
                        {contract.statesCovered.join(', ')}
                      </td>
                      <td className="px-4 py-3.5">
                        {isRenewal ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span>Renewal Due</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-700 tabular-nums">
                        {contract.renewalDate}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs font-semibold text-slate-900 tabular-nums">
                        {contract.reimbursementRate}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-600 tabular-nums">
                        {contract.avgDaysToPay}d
                      </td>
                      <td className="py-3.5 pl-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedContractId(contract.id);
                          }}
                          className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] whitespace-nowrap"
                        >
                          View terms
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

      {/* Contract Fee Schedule & Renewal Drawer */}
      {selectedContract && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedContract.payerName} contract details`}
        >
          <div
            className="fixed inset-0 bg-[#0F2040]/30 backdrop-blur-[1px]"
            onClick={() => setSelectedContractId(null)}
          />
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-medium text-[#0D9488]">
                  {selectedContract.statesCovered.join(' · ')}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">
                  {selectedContract.payerName}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedContract.planLine}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedContractId(null)}
                aria-label="Close contract drawer"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Contracted rate</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
                    {selectedContract.reimbursementRate}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Renewal date</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
                    {selectedContract.renewalDate}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Effective date</span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {selectedContract.effectiveDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Average days to pay</span>
                  <span className="font-medium text-slate-900 tabular-nums">
                    {selectedContract.avgDaysToPay} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duet account lead</span>
                  <span className="font-medium text-slate-900">
                    {selectedContract.accountLead}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-semibold text-slate-900">
                  Sample CPT fee schedule
                </h4>
                <div className="mt-3 divide-y divide-slate-100">
                  {selectedContract.feeSamples.map((fee) => (
                    <div
                      key={fee.cpt}
                      className="flex items-center justify-between py-2.5 text-xs"
                    >
                      <div>
                        <p className="font-mono font-semibold text-slate-900">
                          CPT {fee.cpt}
                        </p>
                        <p className="text-slate-500">{fee.description}</p>
                      </div>
                      <div className="text-right tabular-nums">
                        <p className="font-mono font-semibold text-slate-900">
                          ${fee.contractedRate}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Medicare ${fee.medicareBenchmark}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6">
              {selectedContract.status === 'Renewal Due' ? (
                <button
                  type="button"
                  onClick={() => onRenewContract(selectedContract.id)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D9488] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0F766E]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Confirm 24-Month Renewal</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Agreement Active &amp; In Good Standing</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
