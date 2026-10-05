import {
  ShieldCheck,
  Search,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  ClipboardCheck,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { kycApi } from "../../../utils/api-service";
import { formatDate } from "../../../utils/format";
import {
  KYC_STATUS_LABELS,
  KYC_PROFILE_FIELDS,
  KYC_DECLARATION_FIELDS,
  kycRequiredDocNames,
  kycCompletion,
  kycChecklist,
} from "../../lib/kyc";

const STATUS_STYLES: Record<string, string> = {
  verified:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  under_review:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  remediation_required:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400",
  failed:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  pending:
    "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
};

const DOC_STYLES: Record<string, string> = {
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400",
  rejected:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400",
  missing:
    "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
};

const DOC_LABELS: Record<string, string> = {
  approved: "Approved",
  pending: "Awaiting review",
  rejected: "Rejected",
  missing: "Not uploaded",
};

const ENTITY_LABELS: Record<string, string> = {
  individual: "Individual",
  "family-office": "Family Office",
  institution: "Institution",
};

function statusOf(inv: any): string {
  return inv?.kycStatus || "pending";
}

function trackOf(inv: any): "foundry" | "harbor" {
  if (inv?.investorTrack) return inv.investorTrack;
  return inv?.investorPlatform === "Urbco Harbor" ? "harbor" : "foundry";
}

function platformOf(inv: any): string {
  return (
    inv?.investorPlatform || (trackOf(inv) === "harbor" ? "Urbco Harbor" : "Urbco Foundry")
  );
}

function displayValue(key: string, value: any): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value)) return value.join(", ");
  if (key === "targetTrack") {
    if (value === "foundry") return "Urbco Foundry";
    if (value === "harbor") return "Urbco Harbor";
  }
  return String(value);
}

export function KycManagement() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"main" | "remediate" | "reject">("main");
  const [remediationSel, setRemediationSel] = useState<string[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDocId, setRejectDocId] = useState<string | null>(null);
  const [docRejectReason, setDocRejectReason] = useState("");

  const fetchInvestors = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await kycApi.getAll();
      setInvestors(data);
    } catch (err) {
      console.error("Failed to fetch KYC records:", err);
      toast.error("Failed to load KYC records");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const selected = useMemo(
    () => investors.find((i) => i.id === selectedId) || null,
    [investors, selectedId],
  );

  const summary = useMemo(() => {
    const count = (s: string) =>
      investors.filter((i) => statusOf(i) === s).length;
    const total = investors.length;
    const avg = total
      ? Math.round(
          investors.reduce((a, i) => a + kycCompletion(i).percent, 0) / total,
        )
      : 0;
    return {
      total,
      verified: count("verified"),
      underReview: count("under_review"),
      remediation: count("remediation_required"),
      failed: count("failed"),
      notSubmitted: count("pending"),
      avg,
    };
  }, [investors]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return investors.filter((inv) => {
      if (statusFilter !== "all" && statusOf(inv) !== statusFilter) return false;
      if (entityFilter !== "all" && (inv.entityType || "individual") !== entityFilter)
        return false;
      if (
        q &&
        !inv.name.toLowerCase().includes(q) &&
        !inv.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [investors, query, statusFilter, entityFilter]);

  const closeDialog = () => {
    setSelectedId(null);
    setPanel("main");
    setRemediationSel([]);
    setRejectReason("");
    setRejectDocId(null);
    setDocRejectReason("");
  };

  const needsNudge = (inv: any) => {
    const s = statusOf(inv);
    return s === "pending" || s === "failed" || s === "remediation_required";
  };

  const handleRemind = async (inv: any) => {
    try {
      await kycApi.sendReminder(inv.id);
      await fetchInvestors(true);
      toast.success(`KYC reminder sent to ${inv.name} (${inv.email})`);
    } catch {
      toast.error("Failed to send reminder");
    }
  };

  const handleApprove = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await kycApi.setKycStatus(selected.id, "verified");
      await fetchInvestors(true);
      toast.success(`KYC verified for ${selected.name}`);
      setPanel("main");
    } catch {
      toast.error("Failed to verify KYC");
    } finally {
      setBusy(false);
    }
  };

  const startRemediation = () => {
    if (!selected) return;
    const items = kycChecklist(selected).filter((it) => !it.done);
    setRemediationSel(items.map((it) => it.id));
    setPanel("remediate");
  };

  const handleRemediate = async () => {
    if (!selected) return;
    if (remediationSel.length === 0) {
      toast.error("Select at least one item for remediation");
      return;
    }
    setBusy(true);
    try {
      const all = kycChecklist(selected);
      const labels = all
        .filter((it) => remediationSel.includes(it.id))
        .map((it) =>
          it.group === "Document"
            ? `${it.label} — missing, rejected, or needs re-upload`
            : `${it.group}: ${it.label} — not provided`,
        );
      await kycApi.setKycStatus(selected.id, "remediation_required", labels);
      await fetchInvestors(true);
      toast.success(
        `Remediation requested from ${selected.name} — ${labels.length} item(s) listed`,
      );
      setPanel("main");
    } catch {
      toast.error("Failed to request remediation");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!rejectReason.trim()) {
      toast.error("Provide a rejection reason");
      return;
    }
    setBusy(true);
    try {
      await kycApi.setKycStatus(selected.id, "failed", [rejectReason.trim()]);
      await fetchInvestors(true);
      toast.success(`KYC rejected for ${selected.name}`);
      setPanel("main");
      setRejectReason("");
    } catch {
      toast.error("Failed to reject KYC");
    } finally {
      setBusy(false);
    }
  };

  const handleDocDecision = async (
    docId: string,
    status: string,
    reason?: string,
  ) => {
    if (!selected || docId.startsWith("missing-")) return;
    setBusy(true);
    try {
      await kycApi.updateDocument(selected.id, docId, {
        status,
        rejectReason: reason,
      });
      await fetchInvestors(true);
      toast.success(
        status === "approved"
          ? "Document approved"
          : "Document rejected — user must re-upload",
      );
      setRejectDocId(null);
      setDocRejectReason("");
    } catch {
      toast.error("Failed to update document");
    } finally {
      setBusy(false);
    }
  };

  const selectedCompletion = selected ? kycCompletion(selected) : null;

  // Required doc rows (synthesize "missing" rows for docs never uploaded)
  const docRows = useMemo(() => {
    if (!selected) return [];
    const entity = selected.entityType || "individual";
    const existing = selected.kycDocuments || [];
    return kycRequiredDocNames(entity, trackOf(selected)).map((name) => {
      const doc = existing.find((d: any) => d.name === name);
      return (
        doc || {
          id: `missing-${name}`,
          entityType: entity,
          name,
          fileUrl: null,
          status: "missing",
        }
      );
    });
  }, [selected]);

  const checklist = useMemo(
    () => (selected ? kycChecklist(selected) : []),
    [selected],
  );

  const renderProfileFields = (inv: any) => {
    const entity = inv.entityType || "individual";
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {KYC_PROFILE_FIELDS[entity].map((f) => {
          const value = displayValue(f.key, inv.kycProfile?.[f.key]);
          return (
            <div key={f.key}>
              <p className="text-xs font-medium text-muted-foreground">
                {f.label}
              </p>
              {value ? (
                <p className="text-sm">{value}</p>
              ) : (
                <p className="text-sm font-medium text-red-500">Not provided</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDeclarations = (inv: any) => {
    const entity = inv.entityType || "individual";
    const fields = KYC_DECLARATION_FIELDS[entity];
    if (fields.length === 0) return null;
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {fields.map((f) => {
          const value = displayValue(f.key, inv.kycDeclarations?.[f.key]);
          return (
            <div key={f.key}>
              <p className="text-xs font-medium text-muted-foreground">
                {f.label}
              </p>
              {value ? (
                <p className="text-sm">{value}</p>
              ) : (
                <p className="text-sm font-medium text-red-500">Not provided</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const groupedChecklist = useMemo(() => {
    const groups: Record<string, typeof checklist> = {};
    for (const item of checklist) {
      (groups[item.group] = groups[item.group] || []).push(item);
    }
    return groups;
  }, [checklist]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-primary" />
            KYC Review
          </h1>
          <p className="text-sm text-muted-foreground">
            Review, verify and chase incomplete investor KYC / KYB submissions
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchInvestors()}
          disabled={loading}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Total Records
            </p>
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-[11px] text-muted-foreground">
              {summary.failed} rejected · {summary.remediation} remediation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Verified</p>
            <p className="text-2xl font-bold text-emerald-600">
              {summary.verified}
            </p>
            <p className="text-[11px] text-muted-foreground">
              fully approved
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Under Review
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {summary.underReview}
            </p>
            <p className="text-[11px] text-muted-foreground">
              awaiting decision
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Action Needed
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {summary.remediation + summary.failed}
            </p>
            <p className="text-[11px] text-muted-foreground">
              remediate or re-submit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Not Submitted
            </p>
            <p className="text-2xl font-bold text-slate-500">
              {summary.notSubmitted}
            </p>
            <p className="text-[11px] text-muted-foreground">
              nudge to finish
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">
              Avg. Completion
            </p>
            <p className="text-2xl font-bold">{summary.avg}%</p>
            <Progress value={summary.avg} className="mt-1 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(
              [
                "pending",
                "under_review",
                "remediation_required",
                "failed",
                "verified",
              ] as const
            ).map((s) => (
              <SelectItem key={s} value={s}>
                {KYC_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All entity types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="family-office">Family Office</SelectItem>
            <SelectItem value="institution">Institution</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queue table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading KYC records…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No investors match your filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Track</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const status = statusOf(inv);
                  const completion = kycCompletion(inv);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <p className="font-medium">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inv.email}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ENTITY_LABELS[inv.entityType || "individual"]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            trackOf(inv) === "harbor"
                              ? "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-400"
                              : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
                          }
                        >
                          {platformOf(inv)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_STYLES[status] || STATUS_STYLES.pending}
                        >
                          {KYC_STATUS_LABELS[
                            status as keyof typeof KYC_STATUS_LABELS
                          ] || KYC_STATUS_LABELS.pending}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={completion.percent}
                            className="h-1.5 w-24"
                          />
                          <span className="text-xs font-medium tabular-nums">
                            {completion.percent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.kycSubmittedAt
                          ? formatDate(inv.kycSubmittedAt)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setPanel("main");
                              setSelectedId(inv.id);
                            }}
                          >
                            Review
                          </Button>
                          {needsNudge(inv) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Send this investor a reminder to finish their KYC"
                              onClick={() => handleRemind(inv)}
                            >
                              <Mail className="mr-1 h-4 w-4" />
                              Remind
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review dialog */}
      <Dialog
        open={!!selectedId}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {panel === "remediate"
                ? `Request Remediation — ${selected?.name || ""}`
                : panel === "reject"
                  ? `Reject KYC — ${selected?.name || ""}`
                  : `KYC Review — ${selected?.name || ""}`}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `${selected.email} · ${ENTITY_LABELS[selected.entityType || "individual"]} · ${platformOf(selected)}${
                    selected.kycSubmittedAt
                      ? ` · submitted ${formatDate(selected.kycSubmittedAt)}`
                      : ""
                  }`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="max-h-[65vh] space-y-5 overflow-y-auto pr-1">
              {panel === "main" && selectedCompletion && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Badge
                      variant="outline"
                      className={
                        STATUS_STYLES[statusOf(selected)] || STATUS_STYLES.pending
                      }
                    >
                      {KYC_STATUS_LABELS[
                        statusOf(selected) as keyof typeof KYC_STATUS_LABELS
                      ] || KYC_STATUS_LABELS.pending}
                    </Badge>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {selectedCompletion.percent}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        complete
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Profile
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedCompletion.profile.done}/
                        {selectedCompletion.profile.total}
                      </p>
                      <Progress
                        value={
                          (selectedCompletion.profile.done /
                            Math.max(selectedCompletion.profile.total, 1)) *
                          100
                        }
                        className="mt-1 h-1.5"
                      />
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Documents
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedCompletion.documents.done}/
                        {selectedCompletion.documents.total}
                      </p>
                      <Progress
                        value={
                          (selectedCompletion.documents.done /
                            Math.max(selectedCompletion.documents.total, 1)) *
                          100
                        }
                        className="mt-1 h-1.5"
                      />
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Declarations
                      </p>
                      <p className="text-sm font-semibold">
                        {selectedCompletion.declarations.done}/
                        {selectedCompletion.declarations.total}
                      </p>
                      <Progress
                        value={
                          (selectedCompletion.declarations.done /
                            Math.max(
                              selectedCompletion.declarations.total,
                              1,
                            )) *
                          100
                        }
                        className="mt-1 h-1.5"
                      />
                    </div>
                  </div>

                  {(statusOf(selected) === "remediation_required" ||
                    statusOf(selected) === "failed") &&
                    (selected.kycRemediationItems || []).length > 0 && (
                      <div
                        className={`rounded-lg border p-3 text-sm ${
                          statusOf(selected) === "failed"
                            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                            : "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950"
                        }`}
                      >
                        <p className="flex items-center gap-2 font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          {statusOf(selected) === "failed"
                            ? "Rejected — user must fix:"
                            : "Remediation required — user must fix:"}
                        </p>
                        <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                          {(selected.kycRemediationItems || []).map(
                            (item: string, idx: number) => (
                              <li key={idx}>{item}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <User className="h-4 w-4 text-primary" />
                      Profile
                    </h3>
                    {renderProfileFields(selected)}
                  </section>

                  {KYC_DECLARATION_FIELDS[
                    selected.entityType || "individual"
                  ].length > 0 && (
                    <section>
                      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <ClipboardCheck className="h-4 w-4 text-primary" />
                        Declarations
                      </h3>
                      {renderDeclarations(selected)}
                    </section>
                  )}

                  <section>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <FileText className="h-4 w-4 text-primary" />
                      Documents ({selectedCompletion.documents.done}/
                      {selectedCompletion.documents.total} uploaded)
                    </h3>
                    <div className="space-y-2">
                      {docRows.map((doc: any) => (
                        <div key={doc.id} className="rounded-lg border">
                          <div className="flex flex-wrap items-center justify-between gap-2 p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{doc.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {doc.fileUrl
                                  ? doc.fileUrl.split("/").pop()
                                  : "Not uploaded"}
                                {doc.status === "rejected" && doc.rejectReason
                                  ? ` · ${doc.rejectReason}`
                                  : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={DOC_STYLES[doc.status]}
                              >
                                {doc.status === "approved" && (
                                  <CheckCircle2 className="mr-1 h-3 w-3" />
                                )}
                                {doc.status === "rejected" && (
                                  <XCircle className="mr-1 h-3 w-3" />
                                )}
                                {doc.status === "pending" && (
                                  <Clock className="mr-1 h-3 w-3" />
                                )}
                                {DOC_LABELS[doc.status] || doc.status}
                              </Badge>
                              {doc.status === "pending" && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-emerald-600 hover:text-emerald-700"
                                    disabled={busy}
                                    onClick={() =>
                                      handleDocDecision(doc.id, "approved")
                                    }
                                  >
                                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-red-600 hover:text-red-700"
                                    disabled={busy}
                                    onClick={() => {
                                      setRejectDocId(doc.id);
                                      setDocRejectReason("");
                                    }}
                                  >
                                    <XCircle className="mr-1 h-3.5 w-3.5" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {doc.status === "missing" && (
                                <span className="text-xs text-muted-foreground">
                                  Awaiting upload
                                </span>
                              )}
                            </div>
                          </div>
                          {rejectDocId === doc.id && (
                            <div className="border-t p-3">
                              <Label className="text-xs">
                                Rejection reason (shown to the user)
                              </Label>
                              <Textarea
                                className="mt-1 h-16 text-sm"
                                placeholder="e.g. Photo is blurry — re-upload holding ID next to face"
                                value={docRejectReason}
                                onChange={(e) =>
                                  setDocRejectReason(e.target.value)
                                }
                              />
                              <div className="mt-2 flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setRejectDocId(null)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={busy}
                                  onClick={() =>
                                    handleDocDecision(
                                      doc.id,
                                      "rejected",
                                      docRejectReason.trim() ||
                                        "Does not meet requirements",
                                    )
                                  }
                                >
                                  Confirm Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {panel === "remediate" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select the items the user must fix. They will see these as a
                    checklist on their remediation banner.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setRemediationSel(
                          checklist.filter((it) => !it.done).map((it) => it.id),
                        )
                      }
                    >
                      Select incomplete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setRemediationSel(checklist.map((it) => it.id))
                      }
                    >
                      Select all
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRemediationSel([])}
                    >
                      Clear
                    </Button>
                  </div>
                  {(
                    ["Profile", "Document", "Declaration"] as const
                  ).map((group) =>
                    groupedChecklist[group] ? (
                      <div key={group}>
                        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          {group}
                        </p>
                        <div className="space-y-2">
                          {groupedChecklist[group].map((item) => (
                            <label
                              key={item.id}
                              className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm"
                            >
                              <Checkbox
                                checked={remediationSel.includes(item.id)}
                                onCheckedChange={(checked) =>
                                  setRemediationSel((prev) =>
                                    checked
                                      ? [...prev, item.id]
                                      : prev.filter((x) => x !== item.id),
                                  )
                                }
                              />
                              <span className="flex-1">{item.label}</span>
                              <span
                                className={
                                  item.done
                                    ? "text-xs text-emerald-600"
                                    : "text-xs font-medium text-red-500"
                                }
                              >
                                {item.done ? "Done" : "Incomplete"}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null,
                  )}
                </div>
              )}

              {panel === "reject" && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm dark:border-red-900 dark:bg-red-950">
                    <p className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      Rejecting sets this KYC to Rejected. The investor will see
                      the reason and can re-submit.
                    </p>
                  </div>
                  <Label htmlFor="reject-reason">Rejection reason</Label>
                  <Textarea
                    id="reject-reason"
                    className="h-24"
                    placeholder="e.g. Passport expired — upload a valid government photo ID"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            {panel === "main" && (
              <>
                <p className="order-2 text-xs text-muted-foreground sm:order-1">
                  {selected?.kycLastRemindedAt
                    ? `Last reminder: ${formatDate(selected.kycLastRemindedAt)}`
                    : "No reminder sent yet"}
                </p>
                <div className="order-1 flex flex-wrap justify-end gap-2 sm:order-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => selected && handleRemind(selected)}
                  >
                    <Mail className="mr-1 h-4 w-4" />
                    Remind
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy || statusOf(selected!) === "failed"}
                    onClick={() => setPanel("reject")}
                  >
                    Reject KYC
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={startRemediation}
                  >
                    Request Remediation
                  </Button>
                  <Button
                    size="sm"
                    disabled={busy || statusOf(selected!) === "verified"}
                    onClick={handleApprove}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Approve KYC
                  </Button>
                </div>
              </>
            )}
            {panel === "remediate" && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setPanel("main")}>
                  Back
                </Button>
                <Button size="sm" disabled={busy} onClick={handleRemediate}>
                  Send Remediation Request ({remediationSel.length})
                </Button>
              </>
            )}
            {panel === "reject" && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setPanel("main")}>
                  Back
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={busy}
                  onClick={handleReject}
                >
                  Confirm Rejection
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
