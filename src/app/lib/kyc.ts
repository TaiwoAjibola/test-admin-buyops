// ══════════════════════════════════════════════════════════════════════════
// KYC SPEC — shared definitions for the admin KYC review system
// Canonical doc sets per entityType (institution = 8-doc onboarding KYB set
// per §2.3 of the KYC spec). Completion = user progress across profile
// fields + required documents + declarations.
// ══════════════════════════════════════════════════════════════════════════

export type KycEntityType = "individual" | "family-office" | "institution";
export type KycTrack = "foundry" | "harbor";
export type KycStatus =
  | "pending"
  | "under_review"
  | "verified"
  | "failed"
  | "remediation_required";
export type KycDocStatus = "missing" | "pending" | "approved" | "rejected";

export interface KycDocument {
  id: string;
  entityType: KycEntityType;
  name: string;
  fileUrl: string | null;
  status: KycDocStatus;
  rejectReason?: string;
}

export interface KycProfileFieldDef {
  key: string;
  label: string;
}

export const KYC_ENTITY_TYPES: KycEntityType[] = [
  "individual",
  "family-office",
  "institution",
];

export const KYC_STATUS_LABELS: Record<KycStatus, string> = {
  pending: "Not submitted",
  under_review: "Under review",
  verified: "Verified",
  failed: "Rejected",
  remediation_required: "Remediation required",
};

// ── Profile fields (non-document) collected per entityType ─────────────────
export const KYC_PROFILE_FIELDS: Record<KycEntityType, KycProfileFieldDef[]> = {
  individual: [
    { key: "nationalId", label: "National ID (NIN)" },
    { key: "bvn", label: "BVN" },
    { key: "residentialAddress", label: "Residential Address" },
  ],
  "family-office": [
    { key: "companyName", label: "Company Name" },
    { key: "rcNumber", label: "RC Number" },
    { key: "companyAddress", label: "Company Address" },
    { key: "repName", label: "Authorized Representative" },
    { key: "repEmail", label: "Representative Email" },
  ],
  institution: [
    { key: "companyName", label: "Company Name" },
    { key: "rcNumber", label: "RC Number" },
    { key: "companyAddress", label: "Company Address" },
    { key: "repName", label: "Authorized Representative" },
    { key: "repEmail", label: "Representative Email" },
    { key: "institutionType", label: "Institution Type" },
    { key: "structure", label: "Structure" },
    { key: "aumRange", label: "AUM Range" },
    { key: "horizon", label: "Investment Horizon" },
    { key: "sectors", label: "Sectors of Interest" },
    { key: "regulatoryStatus", label: "Regulatory Status" },
  ],
};

// ── Declaration fields per entityType ──────────────────────────────────────
export const KYC_DECLARATION_FIELDS: Record<
  KycEntityType,
  KycProfileFieldDef[]
> = {
  individual: [
    { key: "sourceOfFunds", label: "Source of Funds" },
    { key: "targetTrack", label: "Target Investment Track" },
  ],
  "family-office": [
    { key: "declaredAumRange", label: "Declared AUM Range" },
    { key: "targetTrack", label: "Target Investment Track" },
  ],
  institution: [],
};

// ── Document sets ──────────────────────────────────────────────────────────
export const INDIVIDUAL_DOCS = [
  "Government Photo ID",
  "Live Biometric Selfie",
  "Proof of Address",
  "Accreditation Questionnaire",
];

export const FAMILY_OFFICE_DOCS = [
  "Articles of Incorporation",
  "Trustee/Director Passports",
  "Proof of AUM / Asset Scale",
  "Beneficial Ownership (UBO)",
];

export const INSTITUTION_DOCS = [
  "Articles of Incorporation",
  "Trustee/Director Passports",
  "Board Resolution Letter",
  "Beneficial Ownership (UBO)",
  "Corporate Registration & Tax ID",
  "Officer / Director Identification",
  "AML Compliance Certificate",
];

export function kycRequiredDocNames(
  entityType: KycEntityType,
  track: KycTrack,
): string[] {
  if (entityType === "individual") return [...INDIVIDUAL_DOCS];
  if (entityType === "family-office") return [...FAMILY_OFFICE_DOCS];
  // Institution = 7-doc KYB set + (if Harbour track) individual set (§2.3 #8)
  const docs = [...INSTITUTION_DOCS];
  if (track === "harbor") docs.push(...INDIVIDUAL_DOCS);
  return docs;
}

// ── Completion calculation ─────────────────────────────────────────────────
function isEmptyValue(v: any): boolean {
  if (v === undefined || v === null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === "string") return v.trim().length === 0;
  return false;
}

export interface KycCompletionBreak {
  done: number;
  total: number;
}

export interface KycCompletion {
  percent: number;
  profile: KycCompletionBreak;
  documents: KycCompletionBreak;
  declarations: KycCompletionBreak;
}

/** User-side progress: filled profile fields + uploaded docs (approved or
 *  awaiting review) + filled declarations, over all required items. */
export function kycCompletion(investor: any): KycCompletion {
  const entityType: KycEntityType = investor?.entityType || "individual";
  const track: KycTrack =
    investor?.investorTrack ||
    (investor?.investorPlatform === "Urbco Harbor" ? "harbor" : "foundry");

  const profileDefs = KYC_PROFILE_FIELDS[entityType];
  const declDefs = KYC_DECLARATION_FIELDS[entityType];
  const docNames = kycRequiredDocNames(entityType, track);

  const profile = investor?.kycProfile || {};
  const declarations = investor?.kycDeclarations || {};
  const documents: KycDocument[] = investor?.kycDocuments || [];

  const profileDone = profileDefs.filter(
    (f) => !isEmptyValue(profile[f.key]),
  ).length;
  const declDone = declDefs.filter(
    (f) => !isEmptyValue(declarations[f.key]),
  ).length;
  // Uploaded = approved or pending review. Rejected needs a re-upload;
  // missing was never uploaded — neither counts as user progress.
  const docsDone = docNames.filter((name) => {
    const doc = documents.find((d) => d.name === name);
    return doc && (doc.status === "approved" || doc.status === "pending");
  }).length;

  const total = profileDefs.length + declDefs.length + docNames.length;
  const done = profileDone + declDone + docsDone;

  return {
    percent: total ? Math.round((done / total) * 100) : 0,
    profile: { done: profileDone, total: profileDefs.length },
    documents: { done: docsDone, total: docNames.length },
    declarations: { done: declDone, total: declDefs.length },
  };
}

// ── Remediation checklist (what has NOT been done) ─────────────────────────
export interface KycChecklistItem {
  id: string;
  group: "Profile" | "Document" | "Declaration";
  label: string;
  done: boolean;
}

export function kycChecklist(investor: any): KycChecklistItem[] {
  const entityType: KycEntityType = investor?.entityType || "individual";
  const track: KycTrack =
    investor?.investorTrack ||
    (investor?.investorPlatform === "Urbco Harbor" ? "harbor" : "foundry");

  const items: KycChecklistItem[] = [];

  for (const f of KYC_PROFILE_FIELDS[entityType]) {
    items.push({
      id: `profile:${f.key}`,
      group: "Profile",
      label: f.label,
      done: !isEmptyValue(investor?.kycProfile?.[f.key]),
    });
  }
  for (const name of kycRequiredDocNames(entityType, track)) {
    const doc = (investor?.kycDocuments || []).find(
      (d: KycDocument) => d.name === name,
    );
    items.push({
      id: `doc:${name}`,
      group: "Document",
      label: name,
      done: !!doc && (doc.status === "approved" || doc.status === "pending"),
    });
  }
  for (const f of KYC_DECLARATION_FIELDS[entityType]) {
    items.push({
      id: `decl:${f.key}`,
      group: "Declaration",
      label: f.label,
      done: !isEmptyValue(investor?.kycDeclarations?.[f.key]),
    });
  }
  return items;
}
