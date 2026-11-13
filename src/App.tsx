import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { BillingCodingSection } from './components/BillingCodingSection';
import { ClinicsSection } from './components/ClinicsSection';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { NPOnboardingSection } from './components/NPOnboardingSection';
import { OverviewSection } from './components/OverviewSection';
import { PayerContractsSection } from './components/PayerContractsSection';
import { Sidebar } from './components/Sidebar';
import {
  INITIAL_CLINICS,
  INITIAL_CODING_QUEUE,
  INITIAL_NP_APPLICANTS,
  INITIAL_PAYER_CONTRACTS,
  MONTHLY_REVENUE_DATA,
} from './data/mockData';
import {
  Clinic,
  CodingQueueItem,
  NPApplicant,
  PayerContract,
  QueueItemStatus,
  SectionId,
} from './types/dashboard';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [clinics, setClinics] = useState<Clinic[]>(INITIAL_CLINICS);
  const [codingQueue, setCodingQueue] =
    useState<CodingQueueItem[]>(INITIAL_CODING_QUEUE);
  const [applicants, setApplicants] =
    useState<NPApplicant[]>(INITIAL_NP_APPLICANTS);
  const [contracts, setContracts] =
    useState<PayerContract[]>(INITIAL_PAYER_CONTRACTS);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Clinics handlers
  const handleTriggerOutreach = (clinicId: string) => {
    setClinics((prev) =>
      prev.map((c) =>
        c.id === clinicId ? { ...c, outreachActive: true } : c
      )
    );
    const target = clinics.find((c) => c.id === clinicId);
    showToast(
      `Recall outreach queued for ${target?.name ?? 'clinic'} (${target?.patientsLostToCare ?? 0} patients)`
    );
  };

  const handleApproveCredentialing = (clinicId: string) => {
    setClinics((prev) =>
      prev.map((c) =>
        c.id === clinicId ? { ...c, credentialingStatus: 'Active' } : c
      )
    );
    const target = clinics.find((c) => c.id === clinicId);
    showToast(`Credentialing marked Active for ${target?.name ?? 'clinic'}`);
  };

  // Billing & Coding handlers
  const handleApproveCodingItem = (id: string) => {
    setCodingQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Approved' } : item
      )
    );
    const target = codingQueue.find((i) => i.id === id);
    showToast(`Encounter ${target?.encounterRef ?? ''} approved for claim batch`);
  };

  const handleUpdateCodes = (
    id: string,
    cpt: string,
    icd: string,
    status: QueueItemStatus
  ) => {
    setCodingQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, suggestedCpt: cpt, suggestedIcd: icd, status }
          : item
      )
    );
    const target = codingQueue.find((i) => i.id === id);
    showToast(
      `Encounter ${target?.encounterRef ?? ''} updated (${status})`
    );
  };

  // NP Onboarding handlers
  const handleToggleChecklistItem = (applicantId: string, itemId: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const updatedChecklist = app.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        return { ...app, checklist: updatedChecklist };
      })
    );
  };

  const handleVerifyDocument = (applicantId: string, docId: string) => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app;
        const updatedDocs = app.documents.map((doc) =>
          doc.id === docId
            ? { ...doc, status: 'Verified' as const, updatedAt: 'Nov 13, 2026' }
            : doc
        );
        return { ...app, documents: updatedDocs };
      })
    );
    showToast('Document marked Verified');
  };

  // Payer Contracts handler
  const handleRenewContract = (contractId: string) => {
    setContracts((prev) =>
      prev.map((c) =>
        c.id === contractId
          ? { ...c, status: 'Active', renewalDate: 'Dec 15, 2028' }
          : c
      )
    );
    const target = contracts.find((c) => c.id === contractId);
    showToast(`24-month renewal confirmed for ${target?.payerName ?? 'payer'}`);
  };

  // Real CSV Export for the active section
  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: Array<Array<string | number>> = [];
    let filename = `duet-${activeSection}-nov-2026.csv`;

    if (activeSection === 'overview') {
      headers = ['Month', 'Revenue_USD', 'Claims_Count', 'Paid_Rate_Percent'];
      rows = MONTHLY_REVENUE_DATA.map((m) => [
        m.fullMonth,
        m.revenue,
        m.claimsCount,
        m.paidRate,
      ]);
    } else if (activeSection === 'clinics') {
      headers = [
        'Clinic',
        'City',
        'State',
        'Monthly_Revenue_USD',
        'Coding_Accuracy_Percent',
        'Credentialing_Status',
        'Patients_Lost_To_Care',
      ];
      rows = clinics.map((c) => [
        c.name,
        c.city,
        c.state,
        c.monthlyRevenue,
        c.codingAccuracy,
        c.credentialingStatus,
        c.patientsLostToCare,
      ]);
    } else if (activeSection === 'billing') {
      headers = [
        'Encounter_Ref',
        'Clinic',
        'Payer',
        'Provider',
        'Suggested_CPT',
        'Suggested_ICD',
        'Amount_USD',
        'Turnaround_Hours',
        'Status',
      ];
      rows = codingQueue.map((q) => [
        q.encounterRef,
        q.clinicName,
        q.payer,
        q.providerName,
        q.suggestedCpt,
        q.suggestedIcd,
        q.amount,
        q.turnaroundHours,
        q.status,
      ]);
    } else if (activeSection === 'onboarding') {
      headers = [
        'Applicant',
        'Target_Clinic',
        'State',
        'Current_Step',
        'Checklist_Completed',
        'Checklist_Total',
        'Target_Go_Live',
      ];
      rows = applicants.map((a) => [
        a.name,
        a.targetClinic,
        a.state,
        a.currentStep,
        a.checklist.filter((i) => i.completed).length,
        a.checklist.length,
        a.targetGoLive,
      ]);
    } else {
      headers = [
        'Payer',
        'Plan_Line',
        'States',
        'Status',
        'Renewal_Date',
        'Reimbursement_Rate',
      ];
      rows = contracts.map((c) => [
        c.payerName,
        c.planLine,
        c.statesCovered.join(' '),
        c.status,
        c.renewalDate,
        c.reimbursementRate,
      ]);
    }

    const escapeCell = (val: string | number) => {
      const str = String(val);
      return str.includes(',') ? `"${str.replace(/"/g, '""')}"` : str;
    };

    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map(escapeCell).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filename}`);
  };

  const pendingCodingCount = codingQueue.filter(
    (q) => q.status !== 'Approved'
  ).length;
  const pendingContractsCount = contracts.filter(
    (c) => c.status === 'Renewal Due'
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        pendingCodingCount={pendingCodingCount}
        pendingContractsCount={pendingContractsCount}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <Header
          activeSection={activeSection}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onExportCsv={handleExportCsv}
        />

        <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pt-6 sm:px-6 lg:px-8">
          {activeSection === 'overview' && (
            <OverviewSection
              clinics={clinics}
              codingQueue={codingQueue}
              applicants={applicants}
              contracts={contracts}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === 'clinics' && (
            <ClinicsSection
              clinics={clinics}
              onTriggerOutreach={handleTriggerOutreach}
              onApproveCredentialing={handleApproveCredentialing}
            />
          )}

          {activeSection === 'billing' && (
            <BillingCodingSection
              queue={codingQueue}
              clinics={clinics}
              onApproveItem={handleApproveCodingItem}
              onUpdateCodes={handleUpdateCodes}
            />
          )}

          {activeSection === 'onboarding' && (
            <NPOnboardingSection
              applicants={applicants}
              onToggleChecklistItem={handleToggleChecklistItem}
              onVerifyDocument={handleVerifyDocument}
            />
          )}

          {activeSection === 'contracts' && (
            <PayerContractsSection
              contracts={contracts}
              onRenewContract={handleRenewContract}
            />
          )}

          <Footer />
        </main>
      </div>

      {/* Subtle Action Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 bottom-5 z-50 flex items-center gap-2.5 rounded-xl bg-[#0F2040] px-4 py-3 text-xs font-medium text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0D9488]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="ml-1 rounded p-0.5 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
