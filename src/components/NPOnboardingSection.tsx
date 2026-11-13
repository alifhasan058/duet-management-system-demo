import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileCheck2,
} from 'lucide-react';
import { NPApplicant, OnboardingStep } from '../types/dashboard';

interface NPOnboardingSectionProps {
  applicants: NPApplicant[];
  onToggleChecklistItem: (applicantId: string, itemId: string) => void;
  onVerifyDocument: (applicantId: string, docId: string) => void;
}

const STEPS: OnboardingStep[] = [
  'Apply',
  'Credentialing',
  'Payer contracting',
  'Go live',
];

export const NPOnboardingSection: React.FC<NPOnboardingSectionProps> = ({
  applicants,
  onToggleChecklistItem,
  onVerifyDocument,
}) => {
  const [stepFilter, setStepFilter] = useState<'All' | OnboardingStep>('All');
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>(
    applicants[0]?.id ?? ''
  );

  const filteredApplicants = useMemo(() => {
    if (stepFilter === 'All') return applicants;
    return applicants.filter((a) => a.currentStep === stepFilter);
  }, [applicants, stepFilter]);

  const activeApplicant = useMemo(() => {
    return (
      filteredApplicants.find((a) => a.id === selectedApplicantId) ??
      filteredApplicants[0] ??
      applicants[0]
    );
  }, [filteredApplicants, selectedApplicantId, applicants]);

  const stepCounts = useMemo(() => {
    return STEPS.map((step) => ({
      step,
      count: applicants.filter((a) => a.currentStep === step).length,
    }));
  }, [applicants]);

  const completedTasks = activeApplicant
    ? activeApplicant.checklist.filter((c) => c.completed).length
    : 0;
  const totalTasks = activeApplicant ? activeApplicant.checklist.length : 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 4-Step Pipeline Interactive Filter */}
      <div className="rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              NP onboarding pipeline
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              4-stage credentialing and payer activation workflow · 5 active applicants
            </p>
          </div>
          {stepFilter !== 'All' && (
            <button
              type="button"
              onClick={() => setStepFilter('All')}
              className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E]"
            >
              Show all 5 applicants
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stepCounts.map(({ step, count }, idx) => {
            const isSelected = stepFilter === step;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setStepFilter(isSelected ? 'All' : step)}
                className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-[#0D9488] bg-[#0D9488]/5'
                    : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-slate-500 tabular-nums">
                    0{idx + 1}. Stage
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {step}
                  </p>
                </div>
                <span
                  className={`text-xl font-semibold tabular-nums ${
                    isSelected ? 'text-[#0D9488]' : 'text-slate-900'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Master-Detail Applicant View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Applicants List (5 Sample Applicants) */}
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)] lg:col-span-5">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Applicants ({filteredApplicants.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredApplicants.map((applicant) => {
              const done = applicant.checklist.filter((c) => c.completed).length;
              const total = applicant.checklist.length;
              const pct = Math.round((done / total) * 100);
              const isSelected = activeApplicant?.id === applicant.id;

              return (
                <button
                  key={applicant.id}
                  type="button"
                  onClick={() => setSelectedApplicantId(applicant.id)}
                  className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                    isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {applicant.name}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {applicant.targetClinic} ({applicant.state}) ·{' '}
                      <span
                        className={`font-medium ${
                          applicant.currentStep === 'Go live'
                            ? 'text-emerald-600'
                            : 'text-[#0D9488]'
                        }`}
                      >
                        {applicant.currentStep}
                      </span>
                    </p>

                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          style={{ width: `${pct}%` }}
                          className={`h-full rounded-full transition-all duration-200 ${
                            pct === 100 ? 'bg-emerald-500' : 'bg-[#0D9488]'
                          }`}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-medium text-slate-600 tabular-nums">
                        {done}/{total}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${
                      isSelected ? 'text-[#0D9488]' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Applicant Interactive Details */}
        {activeApplicant && (
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl bg-white p-6 shadow-[0_1px_3px_rgba(15,32,64,0.06),0_4px_12px_rgba(15,32,64,0.03)]">
              {/* Applicant Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {activeApplicant.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {activeApplicant.credentials} · {activeApplicant.specialty} ·
                    NPI{' '}
                    <span className="font-mono text-slate-700">
                      {activeApplicant.npiNumber}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Target Go live</p>
                  <p className="text-sm font-semibold text-slate-900 tabular-nums">
                    {activeApplicant.targetGoLive}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-5">
                <h4 className="text-xs font-semibold text-slate-900">
                  Onboarding timeline
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activeApplicant.timeline.map((event) => (
                    <div
                      key={event.step}
                      className={`rounded-xl border p-3.5 ${
                        event.state === 'current'
                          ? 'border-[#0D9488]/40 bg-[#0D9488]/5'
                          : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                          {event.state === 'completed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          ) : event.state === 'current' ? (
                            <Clock className="h-3.5 w-3.5 text-[#0D9488]" />
                          ) : (
                            <span className="h-2 w-2 rounded-full bg-slate-300" />
                          )}
                          <span>{event.step}</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                          {event.date}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-slate-600">
                        {event.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Checklist */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Checklist progress
                  </h4>
                  <span className="font-mono text-xs font-semibold text-[#0D9488] tabular-nums">
                    {progressPercent}% ({completedTasks}/{totalTasks})
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {activeApplicant.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() =>
                            onToggleChecklistItem(activeApplicant.id, item.id)
                          }
                          className="h-4 w-4 rounded border-slate-300 text-[#0D9488] accent-[#0D9488] focus:ring-[#0D9488]"
                        />
                        <span
                          className={`text-xs ${
                            item.completed
                              ? 'text-slate-500 line-through'
                              : 'font-medium text-slate-800'
                          }`}
                        >
                          {item.label}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">
                        {item.step}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Documents Status */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h4 className="text-xs font-semibold text-slate-900">
                  Documents status
                </h4>
                <div className="mt-3 divide-y divide-slate-100">
                  {activeApplicant.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-900">
                          {doc.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Updated {doc.updatedAt}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {doc.status === 'Verified' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <FileCheck2 className="h-3.5 w-3.5" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span>{doc.status}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onVerifyDocument(activeApplicant.id, doc.id)
                              }
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Mark Verified
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
