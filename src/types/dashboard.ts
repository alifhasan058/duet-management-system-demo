export type SectionId =
  | 'overview'
  | 'clinics'
  | 'billing'
  | 'onboarding'
  | 'contracts';

export interface MonthlyRevenuePoint {
  month: string;
  fullMonth: string;
  revenue: number;
  claimsCount: number;
  paidRate: number;
}

export interface PayerClaimSplit {
  payer: 'Anthem' | 'Cigna' | 'Centene' | 'Molina';
  percentage: number;
  claimsCount: number;
  amount: number;
  paidRate: number;
  color: string;
}

export type CredentialingStatus = 'Active' | 'Pending';

export interface Clinic {
  id: string;
  name: string;
  city: string;
  state: string;
  monthlyRevenue: number;
  codingAccuracy: number;
  credentialingStatus: CredentialingStatus;
  patientsLostToCare: number;
  patientsReengaged: number;
  activeNPs: number;
  primaryPayer: string;
  lastAuditDate: string;
  outreachActive?: boolean;
}

export type QueueItemStatus = 'Needs Review' | 'Approved' | 'Flagged';

export interface CodingQueueItem {
  id: string;
  encounterRef: string;
  serviceDate: string;
  visitType: string;
  clinicId: string;
  clinicName: string;
  payer: 'Anthem' | 'Cigna' | 'Centene' | 'Molina';
  providerName: string;
  suggestedCpt: string;
  suggestedIcd: string;
  aiConfidence: number;
  rationale: string;
  amount: number;
  turnaroundHours: number;
  status: QueueItemStatus;
}

export type OnboardingStep =
  | 'Apply'
  | 'Credentialing'
  | 'Payer contracting'
  | 'Go live';

export type DocumentStatus = 'Verified' | 'Pending Review' | 'Missing';

export interface ApplicantDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  updatedAt: string;
}

export interface OnboardingChecklistItem {
  id: string;
  label: string;
  step: OnboardingStep;
  completed: boolean;
}

export interface OnboardingTimelineEvent {
  step: OnboardingStep;
  date: string;
  note: string;
  state: 'completed' | 'current' | 'upcoming';
}

export interface NPApplicant {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  targetClinic: string;
  state: string;
  currentStep: OnboardingStep;
  appliedDate: string;
  targetGoLive: string;
  npiNumber: string;
  checklist: OnboardingChecklistItem[];
  documents: ApplicantDocument[];
  timeline: OnboardingTimelineEvent[];
}

export type ContractStatus = 'Active' | 'Renewal Due';

export interface FeeScheduleSample {
  cpt: string;
  description: string;
  contractedRate: number;
  medicareBenchmark: number;
}

export interface PayerContract {
  id: string;
  payerName: string;
  planLine: string;
  statesCovered: string[];
  status: ContractStatus;
  effectiveDate: string;
  renewalDate: string;
  reimbursementRate: string;
  rateNumeric: number;
  claimsSharePercent: number;
  avgDaysToPay: number;
  accountLead: string;
  feeSamples: FeeScheduleSample[];
}
