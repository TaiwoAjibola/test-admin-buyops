import {
  Building2,
  Calendar,
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  Download,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { NairaSign } from "@/app/components/NairaSign";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { assetsApi, companiesApi } from "../../../utils/api-service";

export function AssetManagement() {
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterDevelopmentStage, setFilterDevelopmentStage] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterCompany, setFilterCompany] = useState<string>("all");
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [viewAsset, setViewAsset] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const [assets, setAssets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const extractError = (err: any) => {
    const message = err?.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    return message || err?.message || "Request failed";
  };

  const fetchAssets = async () => {
    try {
      const filters: any = {};
      if (filterPlatform !== "all") filters.platform = filterPlatform;
      if (filterDevelopmentStage !== "all") filters.developmentStage = filterDevelopmentStage;
      if (filterType !== "all") filters.type = filterType;
      if (filterStatus !== "all") filters.status = filterStatus;
      if (filterCompany !== "all") filters.companyId = filterCompany;
      const [a, c] = await Promise.all([
        assetsApi.getAll(filters),
        companiesApi.getAll(),
      ]);
      setAssets(a);
      setCompanies(c);
    } catch (error) {
      console.error("Fetch assets failed:", error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [filterPlatform, filterDevelopmentStage, filterType, filterStatus, filterCompany]);

  // Form State
  const INITIAL_FORM_DATA = {
    name: "",
    referenceCode: "",
    type: "Off Plan",
    propertyCategory: "Residential",
    projectStatus: "Foundation",
    developmentStage: "Before Development", // "Before Development" | "After Development"
    platform: "Urbco Foundry", // "Urbco Foundry" | "Urbco Harbor"
    location: "",
    address: "",
    company: "",
    description: "",
    landSize: "",
    builtSize: "",
    constructionStart: "",
    constructionEnd: "",
    totalUnits: "",
    availableUnits: "",
    unitConfiguration: [] as string[],
    furnishingStatus: "Unfurnished",
    sharedFacilities: [] as string[],
    facilityManagement: true,
    ownershipType: "Full", // "Full" | "Fractional"
    fractionTotal: "",
    costPerFraction: "",
    landUnitType: "",
    landUnitCount: "",

    // Financial Configuration
    basePrice: "",
    preDevCost: "",
    estimatedDevCost: "",
    markup: "",
    paymentOptions: ["Outright", "Installment"] as string[],
    installmentPeriods: ["6 months", "12 months", "24 months"] as string[],
    downPaymentAmount: "",
    offPlanDiscount: "",
    stageBasedDiscount: "",

    // Investment Returns & Risk Assessment
    targetFunding: "",
    currentFunding: "",
    fundingProgress: "",
    minimumInvestment: "",
    investmentType: "", // "Equity" | "Debt" | "Mezzanine"
    projectedRentalIncome: "",
    rentalFrequency: "Annual",
    operatingCost: "",
    capitalAppreciation: "",
    firstPayoutDate: "",
    rentalYieldMin: "",
    rentalYieldMax: "",
    capitalAppreciationMin: "",
    capitalAppreciationMax: "",
    totalReturnsMin: "",
    totalReturnsMax: "",
    constructionProgress: "",
    riskLevel: "Low",
    riskFactors: [] as string[],
    customRiskFactor: "",
    offPlanSecurity: "",
    exitLiquidity: "High",
    managementMode: "Urbco Foundry-managed",

    // Media & Commissions
    images: 0,
    documents: 0,
    virtualTours: 0,
    videoTourUrl: "",
    leadCommission: "2.5",
    closerCommission: "1.5",
    status: "active",
  };

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customFacilityInput, setCustomFacilityInput] = useState("");
  const [customUnitInput, setCustomUnitInput] = useState("");
  const [markupPct, setMarkupPct] = useState("");
  const [customPctInput, setCustomPctInput] = useState("");

  const totalSteps = 9;

  const updateFormData = (key: keyof typeof INITIAL_FORM_DATA, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleMarkupPctChange = (pct: string) => {
    setMarkupPct(pct);
    if (pct !== "CUSTOM" && pct) {
      const base = parseFloat(formData.basePrice) || 0;
      const amount = ((parseFloat(pct) / 100) * base).toFixed(0);
      updateFormData("markup", amount);
    } else if (pct === "CUSTOM") {
      setCustomPctInput("");
      updateFormData("markup", "");
    }
  };

  const handleCustomPctChange = (pct: string) => {
    setCustomPctInput(pct);
    const base = parseFloat(formData.basePrice) || 0;
    const num = parseFloat(pct);
    updateFormData(
      "markup",
      !pct || isNaN(num) ? "" : ((num / 100) * base).toFixed(0),
    );
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages((prev) => [...prev, ...newImages]);
      setFormData((prev) => ({ ...prev, images: prev.images + newImages.length }));
      toast.success(`${newImages.length} image(s) added`);
    }
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newDocuments = Array.from(files);
      setUploadedDocuments((prev) => [...prev, ...newDocuments]);
      setFormData((prev) => ({ ...prev, documents: prev.documents + newDocuments.length }));
      toast.success(`${newDocuments.length} document(s) added`);
    }
  };

  const locations = Array.from(new Set(assets.map((a) => a.location).filter(Boolean)));
  const assetTypes = Array.from(new Set(assets.map((a) => String(a.type || "").trim()).filter(Boolean)));
  const assetStatuses = Array.from(new Set(assets.map((a) => String(a.status || "").trim()).filter(Boolean)));

  const filteredAssets = assets.filter((asset) => {
    const platformMatch = filterPlatform === "all" || asset.platform === filterPlatform;
    const stageMatch = filterDevelopmentStage === "all" || asset.developmentStage === filterDevelopmentStage;
    const typeMatch = filterType === "all" || (asset.type || "").toLowerCase() === filterType.toLowerCase();
    const statusMatch = filterStatus === "all" || String(asset.status || "").toLowerCase() === String(filterStatus).toLowerCase();
    const locationMatch = filterLocation === "all" || asset.location === filterLocation;
    const companyMatch = filterCompany === "all" || asset.companyId === filterCompany;
    return platformMatch && stageMatch && typeMatch && statusMatch && locationMatch && companyMatch;
  });

  const clearFilters = () => {
    setFilterPlatform("all");
    setFilterDevelopmentStage("all");
    setFilterType("all");
    setFilterStatus("all");
    setFilterLocation("all");
    setFilterCompany("all");
  };

  const hasActiveFilters =
    filterPlatform !== "all" ||
    filterDevelopmentStage !== "all" ||
    filterType !== "all" ||
    filterStatus !== "all" ||
    filterLocation !== "all" ||
    filterCompany !== "all";

  const toggleFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      sharedFacilities: prev.sharedFacilities.includes(facility)
        ? prev.sharedFacilities.filter((f) => f !== facility)
        : [...prev.sharedFacilities, facility],
    }));
  };

  const toggleUnitConfig = (config: string) => {
    setFormData((prev) => ({
      ...prev,
      unitConfiguration: (prev.unitConfiguration as string[]).includes(config)
        ? (prev.unitConfiguration as string[]).filter((c) => c !== config)
        : [...(prev.unitConfiguration as string[]), config],
    }));
  };

  const togglePaymentOption = (option: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentOptions: prev.paymentOptions.includes(option)
        ? prev.paymentOptions.filter((o) => o !== option)
        : [...prev.paymentOptions, option],
    }));
  };

  const toggleInstallmentPeriod = (period: string) => {
    setFormData((prev) => ({
      ...prev,
      installmentPeriods: prev.installmentPeriods.includes(period)
        ? prev.installmentPeriods.filter((p) => p !== period)
        : [...prev.installmentPeriods, period],
    }));
  };

  const toggleRiskFactor = (factor: string) => {
    setFormData((prev) => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(factor)
        ? prev.riskFactors.filter((f) => f !== factor)
        : [...prev.riskFactors, factor],
    }));
  };

  const addCustomRiskFactor = () => {
    if (formData.customRiskFactor.trim()) {
      setFormData((prev) => ({
        ...prev,
        riskFactors: [...prev.riskFactors, formData.customRiskFactor.trim()],
        customRiskFactor: "",
      }));
    }
  };

  const removeRiskFactor = (factor: string) => {
    setFormData((prev) => ({
      ...prev,
      riskFactors: prev.riskFactors.filter((f) => f !== factor),
    }));
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({ ...prev, images: prev.images - 1 }));
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({ ...prev, documents: prev.documents - 1 }));
  };

  // Calculated values
  const finalPrice =
    (parseFloat(formData.basePrice) || 0) + (parseFloat(formData.markup) || 0);
  const rentalYield =
    formData.projectedRentalIncome && finalPrice > 0
      ? (
          (parseFloat(formData.projectedRentalIncome) / finalPrice) *
          100
        ).toFixed(2)
      : "0.00";
  const totalAnnualReturn =
    rentalYield && formData.capitalAppreciation
      ? (
          parseFloat(rentalYield) + parseFloat(formData.capitalAppreciation)
        ).toFixed(2)
      : "0.00";
  const totalCommission =
    (parseFloat(formData.leadCommission) || 0) +
    (parseFloat(formData.closerCommission) || 0);
  const fundingProgress =
    formData.ownershipType === "Fractional" && formData.fractionTotal
      ? Math.floor(Math.random() * 100)
      : 100;

  // Development Stage configuration — drives asset type, project status and pricing options
  const STAGE_OPTIONS = [
    {
      value: "Before Development" as const,
      label: "Pre-Development",
      icon: MapPin,
      sub: "Land · Off-plan · Under construction",
      types: ["Land", "Off Plan", "Under Construction"],
      statuses: [
        "Land Acquisition",
        "Planning",
        "Approvals",
        "Foundation",
        "Under Construction",
      ],
      defaultType: "Off Plan",
      defaultStatus: "Foundation",
      description:
        "The asset does not exist yet — investor capital funds land acquisition, approvals and construction. Entry pricing is based on cost (land + build) plus margin, and returns are realized through off-plan sales, staged discounts or at project completion.",
      chips: [
        "Cost-based pricing",
        "Off-plan & stage discounts",
        "Returns at completion or exit",
        "Key risk: execution & timeline",
      ],
    },
    {
      value: "After Development" as const,
      label: "Post-Development",
      icon: Building2,
      sub: "Completed · Ready to move · Operational",
      types: ["Completed", "Ready to Move", "Operational"],
      statuses: ["Completed", "Available", "Leased", "Sold Out"],
      defaultType: "Completed",
      defaultStatus: "Available",
      description:
        "The asset is built — investors buy into a physical, income-producing property priced at market value. Every figure is verifiable (inspection, occupancy, audited yields) and returns come from rental income and capital appreciation from day one.",
      chips: [
        "Market-based pricing",
        "Income from day one",
        "Verified yield & occupancy",
        "Key risk: occupancy & market",
      ],
    },
  ];

  const stageConfig =
    STAGE_OPTIONS.find((s) => s.value === formData.developmentStage) ||
    STAGE_OPTIONS[0];
  const isBeforeDev = stageConfig.value === "Before Development";

  // Include the current value when editing legacy assets whose combination
  // predates these option lists (e.g. Land + Available)
  const stageTypes = stageConfig.types.includes(formData.type)
    ? stageConfig.types
    : [...stageConfig.types, formData.type];
  const stageStatuses = stageConfig.statuses.includes(formData.projectStatus)
    ? stageConfig.statuses
    : [...stageConfig.statuses, formData.projectStatus];

  const handleStageChange = (stage: (typeof STAGE_OPTIONS)[number]) => {
    if (stage.value === formData.developmentStage) return;
    const typeOk = stage.types.includes(formData.type);
    const statusOk = stage.statuses.includes(formData.projectStatus);
    setFormData((prev) => ({
      ...prev,
      developmentStage: stage.value,
      type: typeOk ? prev.type : stage.defaultType,
      projectStatus: statusOk ? prev.projectStatus : stage.defaultStatus,
    }));
    if (!typeOk || !statusOk) {
      toast.info(
        `Switched to ${stage.label} — asset type and status adjusted to match`,
      );
    }
  };

  // Investment Program configuration — drives investment structure, terms, returns and risk
  const PROGRAM_OPTIONS = [
    {
      value: "Urbco Foundry",
      icon: Zap,
      tag: "Velocity portfolio",
      description:
        "High-velocity property sales, core commercial assets and primary investment portfolios — standard and fractional tickets for retail and individual investors, with fast closings and yield-focused payouts.",
      bullets: [
        "Standard & fractional tickets",
        "Fast-closing retail deals",
        "Yield-focused distributions",
      ],
    },
    {
      value: "Urbco Harbor",
      icon: TrendingUp,
      tag: "Structured capital",
      description:
        "Stationary funding for exceptionally large investments — institutional-scale commitments, long horizons and milestone-based disbursement with full due-diligence disclosure.",
      bullets: [
        "Exceptionally large commitments",
        "Milestone-based disbursement",
        "Institutional due diligence",
      ],
    },
  ];

  const isHarbor = formData.platform === "Urbco Harbor";

  const paymentPeriods = isHarbor
    ? ["12 months", "24 months", "36 months", "48 months", "60 months"]
    : [
        "3 months",
        "6 months",
        "12 months",
        "18 months",
        "24 months",
        "36 months",
      ];

  const rentalFrequencies = isHarbor
    ? ["Semi-Annual", "Annual", "N/A"]
    : ["Monthly", "Quarterly", "Annual", "N/A"];

  const RISK_PRESETS: Record<string, string[]> = {
    "Urbco Foundry": [
      "Construction timeline risk (if applicable)",
      "Market volatility in property sector",
      "Rental income may vary based on occupancy",
      "Regulatory and economic factors",
      "Currency fluctuation risk",
      "Developer financial stability",
    ],
    "Urbco Harbor": [
      "Construction timeline risk (if applicable)",
      "Counterparty & sponsor credit risk",
      "Regulatory and economic factors",
      "Currency fluctuation risk",
      "Developer financial stability",
      "Liquidity risk on large-ticket exit",
    ],
  };
  const presetRiskFactors =
    RISK_PRESETS[formData.platform] || RISK_PRESETS["Urbco Foundry"];

  const handleProgramChange = (program: string) => {
    if (program === formData.platform) return;
    const freqs =
      program === "Urbco Harbor"
        ? ["Semi-Annual", "Annual", "N/A"]
        : ["Monthly", "Quarterly", "Annual", "N/A"];
    const periods =
      program === "Urbco Harbor"
        ? ["12 months", "24 months", "36 months", "48 months", "60 months"]
        : ["3 months", "6 months", "12 months", "18 months", "24 months", "36 months"];
    setFormData((prev) => ({
      ...prev,
      platform: program,
      rentalFrequency: freqs.includes(prev.rentalFrequency)
        ? prev.rentalFrequency
        : program === "Urbco Harbor"
          ? "Annual"
          : "Monthly",
      installmentPeriods: prev.installmentPeriods.filter((p) =>
        periods.includes(p),
      ).length
        ? prev.installmentPeriods.filter((p) => periods.includes(p))
        : program === "Urbco Harbor"
          ? ["12 months", "24 months", "36 months"]
          : ["6 months", "12 months", "24 months"],
      managementMode: /^(BuyOps|Urbco Foundry|Urbco Harbor)-managed$/.test(
        prev.managementMode,
      )
        ? `${program}-managed`
        : prev.managementMode,
    }));
    toast.info(`${program} selected — funding terms and returns adjusted`);
  };

  // Step Navigation & Validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter the Asset Name");
      return false;
    }
    if (!formData.developmentStage) {
      toast.error("Please select the Development Stage");
      return false;
    }
    if (!formData.type) {
      toast.error("Please select the Asset Type");
      return false;
    }
    if (!formData.projectStatus) {
      toast.error("Please select the Project Status");
      return false;
    }
    if (!formData.company) {
      toast.error("Please select a Developer / Partner Company");
      return false;
    }
    if (!formData.location.trim()) {
      toast.error("Please enter the Location");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < totalSteps) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // Build Payload
  const buildAssetPayload = (data: typeof formData) => {
    const basePriceNum = parseFloat(data.basePrice) || parseFloat(data.preDevCost) || 0;
    const markupNum = parseFloat(data.markup) || 0;
    const finalPriceNum = basePriceNum + markupNum;

    return {
      ...data,
      platform: data.platform || "Urbco Foundry",
      developmentStage: data.developmentStage || "Before Development",
      companyId: data.company,
      company: companies.find((c) => c.id === data.company) || { id: data.company, name: "Partner Developer" },
      facilities: data.sharedFacilities,
      fractionCost: data.costPerFraction,
      price: basePriceNum,
      markup: markupNum,
      finalPrice: finalPriceNum,
      furnished: data.furnishingStatus,
      constructionStage: data.constructionProgress,
      totalAnnualReturn: data.totalReturnsMax || data.capitalAppreciation || "15.00",
      unitConfiguration: Array.isArray(data.unitConfiguration)
        ? data.unitConfiguration.join(", ")
        : data.unitConfiguration || "",
    };
  };

  const handleSubmit = async (statusOverride?: string) => {
    if (!formData.name || !formData.company) {
      toast.error("Please complete basic asset details in Step 1.");
      setCurrentStep(1);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const dataToSubmit = statusOverride ? { ...formData, status: statusOverride } : formData;
      const createdAsset = await assetsApi.create(buildAssetPayload(dataToSubmit));

      if (uploadedImages.length > 0) {
        const imageFormData = new FormData();
        uploadedImages.forEach((file) => imageFormData.append("images", file));
        try {
          await assetsApi.uploadImages(createdAsset.id, imageFormData);
        } catch (e) {
          console.error("Image upload failed:", e);
        }
      }

      await fetchAssets();
      setCreateDialogOpen(false);
      setCurrentStep(1);
      setFormData(INITIAL_FORM_DATA);
      setUploadedImages([]);
      setUploadedDocuments([]);
      toast.success("Asset created successfully");
    } catch (err: any) {
      const msg = extractError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (assetId: string) => {
    setSelectedAssetId(assetId);
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      setFormData({
        ...INITIAL_FORM_DATA,
        name: asset.name || "",
        referenceCode: asset.referenceCode || "",
        type: asset.type || "Off Plan",
        propertyCategory: asset.propertyCategory || "Residential",
        projectStatus: asset.projectStatus || "Foundation",
        developmentStage: asset.developmentStage || "Before Development",
        platform: asset.platform || "Urbco Foundry",
        location: asset.location || "",
        address: asset.address || "",
        company: asset.companyId || asset.company?.id || "",
        description: asset.description || "",
        landSize: asset.landSize || "",
        builtSize: asset.builtSize || "",
        constructionStart: asset.constructionStart || "",
        constructionEnd: asset.constructionEnd || "",
        totalUnits: asset.totalUnits?.toString() || "",
        availableUnits: asset.availableUnits?.toString() || "",
        unitConfiguration: asset.unitConfiguration
          ? String(asset.unitConfiguration).split(", ").filter(Boolean)
          : [],
        furnishingStatus: asset.furnished || "Unfurnished",
        sharedFacilities: asset.facilities || [],
        ownershipType: asset.ownershipType || "Full",
        fractionTotal: asset.fractionTotal?.toString() || "",
        costPerFraction: asset.fractionCost?.toString() || "",
        basePrice: asset.price?.toString() || "",
        markup: asset.markup?.toString() || "",
        paymentOptions:
          (asset.paymentOptions as string[] | undefined) ||
          INITIAL_FORM_DATA.paymentOptions,
        installmentPeriods:
          (asset.installmentPeriods as string[] | undefined) ||
          INITIAL_FORM_DATA.installmentPeriods,
        downPaymentAmount: asset.downPaymentAmount?.toString() || "",
        offPlanDiscount: asset.offPlanDiscount?.toString() || "",
        stageBasedDiscount: asset.stageBasedDiscount?.toString() || "",
        targetFunding:
          (asset as any).targetFunding?.toString() ||
          (asset as any).totalInvestmentRequired?.toString() ||
          "",
        currentFunding:
          (asset as any).currentFunding?.toString() || "",
        minimumInvestment:
          (asset as any).minimumInvestment?.toString() || "",
        investmentType: (asset as any).investmentType || "",
        projectedRentalIncome: asset.projectedRentalIncome?.toString() || "",
        rentalFrequency: asset.rentalFrequency || "Annual",
        operatingCost: asset.operatingCost?.toString() || "",
        capitalAppreciation: asset.capitalAppreciation?.toString() || "",
        firstPayoutDate: asset.firstPayoutDate || "",
        rentalYieldMin: asset.rentalYieldMin?.toString() || "",
        rentalYieldMax: asset.rentalYieldMax?.toString() || "",
        capitalAppreciationMin: asset.capitalAppreciationMin?.toString() || "",
        capitalAppreciationMax: asset.capitalAppreciationMax?.toString() || "",
        totalReturnsMin: asset.totalReturnsMin?.toString() || "",
        totalReturnsMax: asset.totalReturnsMax?.toString() || "",
        constructionProgress: asset.constructionStage?.toString() || "",
        riskLevel: asset.riskLevel || "Low",
        riskFactors: asset.riskFactors || [],
        managementMode:
          asset.managementMode ||
          `${asset.platform || "Urbco Foundry"}-managed`,
        leadCommission: asset.leadCommission?.toString() || "2.5",
        closerCommission: asset.closerCommission?.toString() || "1.5",
        status: asset.status || "active",
      });
      setEditDialogOpen(true);
      setCurrentStep(1);
      setMarkupPct("");
      setCustomPctInput("");
    }
  };

  const handleUpdate = async () => {
    if (!selectedAssetId) return;
    setLoading(true);
    setError(null);
    try {
      await assetsApi.update(selectedAssetId, buildAssetPayload(formData));
      await fetchAssets();
      setEditDialogOpen(false);
      setSelectedAssetId(null);
      setFormData(INITIAL_FORM_DATA);
      toast.success("Asset updated successfully");
    } catch (err: any) {
      const msg = extractError(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (asset) {
      setViewAsset(asset);
      setViewDialogOpen(true);
    }
  };

  const handleDelete = (assetId: string) => {
    setSelectedAssetId(assetId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAssetId) return;
    setLoading(true);
    try {
      await assetsApi.delete(selectedAssetId);
      await fetchAssets();
      setDeleteDialogOpen(false);
      setSelectedAssetId(null);
      toast.success("Asset deleted successfully");
    } catch (err: any) {
      toast.error(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  // Calculations for review step
  const computedBase = parseFloat(formData.basePrice) || parseFloat(formData.preDevCost) || 0;
  const computedMarkup = parseFloat(formData.markup) || 0;
  const computedFinal = computedBase + computedMarkup;

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters & Sorting</span>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-7 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>

              {/* Create Asset Trigger */}
              <Dialog
                open={createDialogOpen}
                onOpenChange={(open) => {
                  setCreateDialogOpen(open);
                  if (!open) {
                    setFormData(INITIAL_FORM_DATA);
                    setCurrentStep(1);
                    setUploadedImages([]);
                    setUploadedDocuments([]);
                    setError(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Asset
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
                  <DialogHeader className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <DialogTitle className="text-xl font-bold">
                          Create New Asset
                        </DialogTitle>
                        <DialogDescription className="mt-1 text-sm">
                          Step {currentStep} of {totalSteps}:{" "}
                          {currentStep === 1
                            ? "Asset Identity & Status"
                            : currentStep === 2
                              ? "Physical Details & Facilities"
                              : currentStep === 3
                                ? "Investment Program & Structure"
                                : currentStep === 4
                                  ? "Pricing Logic"
                                  : currentStep === 5
                                    ? "Returns Projections"
                                    : currentStep === 6
                                      ? "Risk & Management Assessment"
                                      : currentStep === 7
                                        ? "Media & Documentation"
                                        : currentStep === 8
                                          ? "Commission Setup"
                                          : "Review & Publish"}
                        </DialogDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            formData.developmentStage === "Before Development"
                              ? "border-amber-500 text-amber-600 bg-amber-50"
                              : "border-emerald-500 text-emerald-600 bg-emerald-50"
                          }
                        >
                          {formData.developmentStage}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={
                            isHarbor
                              ? "border-purple-500 text-purple-600 bg-purple-50"
                              : "border-blue-500 text-blue-600 bg-blue-50"
                          }
                        >
                          {formData.platform}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                      />
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                        {error}
                      </div>
                    )}

                    {/* Step 1: Asset Identity & Status */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        {/* Development Stage — compact segmented toggle */}
                        <div>
                          <Label className="mb-2 block">
                            Development Stage *
                          </Label>
                          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                            {STAGE_OPTIONS.map((stage) => {
                              const selected =
                                formData.developmentStage === stage.value;
                              const Icon = stage.icon;
                              return (
                                <button
                                  key={stage.value}
                                  type="button"
                                  onClick={() => handleStageChange(stage)}
                                  className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                    selected
                                      ? "bg-background shadow-sm border border-border"
                                      : "hover:bg-background/60 border border-transparent"
                                  }`}
                                >
                                  <Icon
                                    className={`h-4 w-4 shrink-0 ${
                                      selected
                                        ? isBeforeDev
                                          ? "text-amber-600"
                                          : "text-emerald-600"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <div
                                      className={`text-sm font-medium ${
                                        selected
                                          ? ""
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {stage.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate">
                                      {stage.sub}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {/* Stage context — what this stage means */}
                          <div
                            className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
                              isBeforeDev
                                ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                                : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            <div className="min-w-0">
                              <p
                                className={`text-xs leading-relaxed ${
                                  isBeforeDev
                                    ? "text-amber-900 dark:text-amber-100"
                                    : "text-emerald-900 dark:text-emerald-100"
                                }`}
                              >
                                {stageConfig.description}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {stageConfig.chips.map((chip) => (
                                  <span
                                    key={chip}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      isBeforeDev
                                        ? "bg-amber-100/70 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200"
                                        : "bg-emerald-100/70 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200"
                                    }`}
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Asset Name *</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                updateFormData("name", e.target.value)
                              }
                              placeholder="e.g., Marina Heights Tower A"
                            />
                          </div>
                          <div>
                            <Label htmlFor="referenceCode">
                              Asset Reference Code *
                            </Label>
                            <Input
                              id="referenceCode"
                              value={formData.referenceCode}
                              onChange={(e) =>
                                updateFormData("referenceCode", e.target.value)
                              }
                              placeholder="e.g., MHT-A-2024"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Asset Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(val) =>
                                updateFormData("type", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {stageTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isBeforeDev
                                ? "Pre-development assets: land, off-plan units or active construction"
                                : "Post-development assets: built and ready for occupation or use"}
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="projectStatus">
                              Project Status *
                            </Label>
                            <Select
                              value={formData.projectStatus}
                              onValueChange={(val) =>
                                updateFormData("projectStatus", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {stageStatuses.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isBeforeDev
                                ? "Where the project sits in the development pipeline"
                                : "Sales / occupancy state of the completed asset"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                              updateFormData("location", e.target.value)
                            }
                            placeholder="e.g., Dubai Marina"
                          />
                        </div>

                        <div>
                          <Label htmlFor="address">Full Address *</Label>
                          <Textarea
                            id="address"
                            value={formData.address}
                            onChange={(e) =>
                              updateFormData("address", e.target.value)
                            }
                            placeholder="Enter complete address with plot/unit details"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="company">Company *</Label>
                          <Select
                            value={formData.company}
                            onValueChange={(val) =>
                              updateFormData("company", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="landSize">Land Size (sqm)</Label>
                            <Input
                              id="landSize"
                              type="number"
                              value={formData.landSize}
                              onChange={(e) =>
                                updateFormData("landSize", e.target.value)
                              }
                              placeholder="5000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="builtSize">
                              Built-up Size (sqm)
                            </Label>
                            <Input
                              id="builtSize"
                              type="number"
                              value={formData.builtSize}
                              onChange={(e) =>
                                updateFormData("builtSize", e.target.value)
                              }
                              placeholder="45000"
                            />
                          </div>
                        </div>

                        {/* Show construction dates only if not Land or Completed */}
                        {formData.type !== "Land" &&
                          formData.type !== "Completed" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="constructionStart">
                                  Construction Start Date
                                </Label>
                                <Input
                                  id="constructionStart"
                                  type="date"
                                  value={formData.constructionStart}
                                  onChange={(e) =>
                                    updateFormData(
                                      "constructionStart",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="constructionEnd">
                                  Expected Completion Date
                                </Label>
                                <Input
                                  id="constructionEnd"
                                  type="date"
                                  value={formData.constructionEnd}
                                  onChange={(e) =>
                                    updateFormData(
                                      "constructionEnd",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Step 2: Physical & Functional Details */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="propertyCategory">
                            Property Category *
                          </Label>
                          <Select
                            value={formData.propertyCategory}
                            onValueChange={(val) =>
                              updateFormData("propertyCategory", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Residential">
                                Residential
                              </SelectItem>
                              <SelectItem value="Commercial">
                                Commercial
                              </SelectItem>
                              <SelectItem value="Mixed-use">
                                Mixed-use
                              </SelectItem>
                              <SelectItem value="Land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="totalUnits">
                              Total Units / Rooms *
                            </Label>
                            <Input
                              id="totalUnits"
                              type="number"
                              value={formData.totalUnits}
                              onChange={(e) =>
                                updateFormData("totalUnits", e.target.value)
                              }
                              placeholder="156"
                            />
                          </div>
                          <div>
                            <Label className="mb-2 block">
                              Unit Configuration *
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                "Studio Apartment",
                                "1 Bedroom",
                                "2 Bedrooms",
                                "3 Bedrooms",
                                "4 Bedrooms",
                                "5 Bedrooms",
                              ].map((config) => (
                                <div
                                  key={config}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`unit-${config}`}
                                    checked={(
                                      formData.unitConfiguration as string[]
                                    ).includes(config)}
                                    onCheckedChange={() =>
                                      toggleUnitConfig(config)
                                    }
                                  />
                                  <label
                                    htmlFor={`unit-${config}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {config}
                                  </label>
                                </div>
                              ))}
                              {(formData.unitConfiguration as string[])
                                .filter(
                                  (c) =>
                                    ![
                                      "Studio Apartment",
                                      "1 Bedroom",
                                      "2 Bedrooms",
                                      "3 Bedrooms",
                                      "4 Bedrooms",
                                      "5 Bedrooms",
                                    ].includes(c),
                                )
                                .map((config) => (
                                  <div
                                    key={config}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`unit-${config}`}
                                      checked
                                      onCheckedChange={() =>
                                        toggleUnitConfig(config)
                                      }
                                    />
                                    <label
                                      htmlFor={`unit-${config}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {config}
                                    </label>
                                  </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={customUnitInput}
                                onChange={(e) =>
                                  setCustomUnitInput(e.target.value)
                                }
                                placeholder="Add custom type"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (customUnitInput.trim()) {
                                    toggleUnitConfig(customUnitInput.trim());
                                    setCustomUnitInput("");
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="furnishingStatus">
                            Furnishing Status *
                          </Label>
                          <Select
                            value={formData.furnishingStatus}
                            onValueChange={(val) =>
                              updateFormData("furnishingStatus", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Unfurnished">
                                Unfurnished
                              </SelectItem>
                              <SelectItem value="Semi-furnished">
                                Semi-furnished
                              </SelectItem>
                              <SelectItem value="Fully furnished">
                                Fully furnished
                              </SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-3 block">
                            Shared Facilities
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              "Pool",
                              "Gym",
                              "Parking",
                              "Security",
                              "Private Beach",
                              "Spa",
                              "Retail",
                              "Meeting Rooms",
                              "Elevators",
                            ].map((facility) => (
                              <div
                                key={facility}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={facility}
                                  checked={formData.sharedFacilities.includes(
                                    facility,
                                  )}
                                  onCheckedChange={() =>
                                    toggleFacility(facility)
                                  }
                                />
                                <label
                                  htmlFor={facility}
                                  className="text-sm cursor-pointer"
                                >
                                  {facility}
                                </label>
                              </div>
                            ))}
                            {formData.sharedFacilities
                              .filter(
                                (f) =>
                                  ![
                                    "Pool",
                                    "Gym",
                                    "Parking",
                                    "Security",
                                    "Private Beach",
                                    "Spa",
                                    "Retail",
                                    "Meeting Rooms",
                                    "Elevators",
                                  ].includes(f),
                              )
                              .map((customF) => (
                                <div
                                  key={customF}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={customF}
                                    checked
                                    onCheckedChange={() =>
                                      toggleFacility(customF)
                                    }
                                  />
                                  <label
                                    htmlFor={customF}
                                    className="text-sm cursor-pointer"
                                  >
                                    {customF}
                                  </label>
                                </div>
                              ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Input
                              value={customFacilityInput}
                              onChange={(e) =>
                                setCustomFacilityInput(e.target.value)
                              }
                              placeholder="Add custom facility"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (customFacilityInput.trim()) {
                                  toggleFacility(customFacilityInput.trim());
                                  setCustomFacilityInput("");
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">
                              Facility Management Included
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Is professional facility management included?
                            </p>
                          </div>
                          <Switch
                            checked={formData.facilityManagement}
                            onCheckedChange={(val) =>
                              updateFormData("facilityManagement", val)
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Investment Program & Structure */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        {/* Investment Program */}
                        <div>
                          <Label className="text-base font-semibold mb-1 block">
                            Investment Program *
                          </Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Defines the kind of investment this asset carries —
                            it shapes ownership structures, funding terms,
                            returns and risk disclosure in the steps that
                            follow.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {PROGRAM_OPTIONS.map((program) => {
                              const selected =
                                formData.platform === program.value;
                              const Icon = program.icon;
                              return (
                                <div
                                  key={program.value}
                                  onClick={() =>
                                    handleProgramChange(program.value)
                                  }
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    selected
                                      ? program.value === "Urbco Harbor"
                                        ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20"
                                        : "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                                      : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 mb-1.5">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        program.value === "Urbco Harbor"
                                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                      }`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm">
                                        {program.value}
                                      </h4>
                                      <span
                                        className={`text-xs font-medium ${
                                          program.value === "Urbco Harbor"
                                            ? "text-purple-600 dark:text-purple-400"
                                            : "text-blue-600 dark:text-blue-400"
                                        }`}
                                      >
                                        {program.tag}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {program.description}
                                  </p>
                                  <ul className="mt-2 space-y-0.5">
                                    {program.bullets.map((b) => (
                                      <li
                                        key={b}
                                        className="text-[11px] text-muted-foreground flex items-center gap-1.5"
                                      >
                                        <span
                                          className={`w-1 h-1 rounded-full shrink-0 ${
                                            program.value === "Urbco Harbor"
                                              ? "bg-purple-500"
                                              : "bg-blue-500"
                                          }`}
                                        />
                                        {b}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label>Ownership Options *</Label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div
                              onClick={() =>
                                updateFormData("ownershipType", "Full")
                              }
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.ownershipType === "Full"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <h4 className="font-medium">Full Ownership</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isHarbor
                                  ? "Whole-asset acquisition by a single institutional buyer"
                                  : "Single owner purchases entire asset"}
                              </p>
                            </div>
                            <div
                              onClick={() =>
                                updateFormData("ownershipType", "Fractional")
                              }
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.ownershipType === "Fractional"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <h4 className="font-medium">
                                Fractional Ownership
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isHarbor
                                  ? "Large fractional blocks sized for institutional commitments"
                                  : "Multiple investors own fractions"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Harbor — large-ticket funding parameters */}
                        {isHarbor && (
                          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Large-Ticket Funding Parameters
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Urbco Harbor structures stationary funding for
                                exceptionally large investments.
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="targetFunding">
                                  Total Funding Required (₦)
                                </Label>
                                <Input
                                  id="targetFunding"
                                  type="number"
                                  value={formData.targetFunding}
                                  onChange={(e) =>
                                    updateFormData(
                                      "targetFunding",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="50000000000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="minimumInvestment">
                                  Minimum Investment (₦)
                                </Label>
                                <Input
                                  id="minimumInvestment"
                                  type="number"
                                  value={formData.minimumInvestment}
                                  onChange={(e) =>
                                    updateFormData(
                                      "minimumInvestment",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="10000000"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="investmentType">
                                Investment Instrument
                              </Label>
                              <Select
                                value={formData.investmentType}
                                onValueChange={(val) =>
                                  updateFormData("investmentType", val)
                                }
                              >
                                <SelectTrigger id="investmentType">
                                  <SelectValue placeholder="Select instrument" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Equity">
                                    Equity
                                  </SelectItem>
                                  <SelectItem value="Debt">Debt</SelectItem>
                                  <SelectItem value="Mezzanine">
                                    Mezzanine
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {formData.ownershipType === "Fractional" && (
                          <>
                            <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                              <h4 className="text-sm font-medium text-accent mb-3">
                                Fraction Breakdown
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                {formData.type === "Land" ? (
                                  <>
                                    <div>
                                      <Label htmlFor="landUnitType">
                                        Land Units *
                                      </Label>
                                      <Select
                                        id="landUnitType"
                                        value={formData.landUnitType || ""}
                                        onValueChange={(val) =>
                                          updateFormData("landUnitType", val)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="sqm">
                                            Per Square Meter
                                          </SelectItem>
                                          <SelectItem value="plot">
                                            Per Plot
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="landUnitCount">
                                        Number of Units *
                                      </Label>
                                      <Input
                                        id="landUnitCount"
                                        type="number"
                                        value={formData.landUnitCount || ""}
                                        onChange={(e) =>
                                          updateFormData(
                                            "landUnitCount",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="e.g. 10"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <Label htmlFor="fractionTotal">
                                        Total Fractions *
                                      </Label>
                                      <Input
                                        id="fractionTotal"
                                        type="number"
                                        value={formData.fractionTotal}
                                        onChange={(e) =>
                                          updateFormData(
                                            "fractionTotal",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="100"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="costPerFraction">
                                        Cost per Fraction (₦) *
                                      </Label>
                                      <Input
                                        id="costPerFraction"
                                        type="number"
                                        value={formData.costPerFraction}
                                        onChange={(e) =>
                                          updateFormData(
                                            "costPerFraction",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="8500"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Funding Progress
                                </span>
                                <span className="text-sm font-semibold">
                                  {fundingProgress}%
                                </span>
                              </div>
                              <Progress
                                value={fundingProgress}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                Auto-calculated based on fraction sales
                              </p>
                            </div>
                          </>
                        )}

                        {formData.ownershipType === "Full" && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <CircleCheck className="h-8 w-8 mx-auto text-accent mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Full ownership selected. Asset will be sold as a
                              single unit.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Pricing & Payment Logic */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="basePrice">
                              Base Asset Value (₦) *
                            </Label>
                            <Input
                              id="basePrice"
                              type="number"
                              value={formData.basePrice}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  basePrice: e.target.value,
                                  markup: "",
                                }));
                                setMarkupPct("");
                                setCustomPctInput("");
                                setCustomPctInput("");
                              }}
                              placeholder="1200000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="markup">BuyOps Markup *</Label>
                            <div className="space-y-2">
                              <Select
                                value={markupPct}
                                onValueChange={handleMarkupPctChange}
                              >
                                <SelectTrigger id="markup">
                                  <SelectValue placeholder="Select markup %" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "1",
                                    "2",
                                    "3",
                                    "5",
                                    "7",
                                    "10",
                                    "15",
                                    "20",
                                  ].map((pct) => (
                                    <SelectItem key={pct} value={pct}>
                                      {pct}%
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="CUSTOM">
                                    Custom %
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {markupPct === "CUSTOM" ? (
                                <div className="space-y-1">
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      value={customPctInput}
                                      onChange={(e) =>
                                        handleCustomPctChange(e.target.value)
                                      }
                                      placeholder="Enter custom %"
                                      className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                      %
                                    </span>
                                  </div>
                                  {formData.markup && (
                                    <p className="text-sm text-muted-foreground">
                                      = ₦
                                      {Number(formData.markup).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                formData.markup && (
                                  <p className="text-sm text-muted-foreground">
                                    = ₦
                                    {Number(formData.markup).toLocaleString()}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                          <div className="text-sm text-muted-foreground">
                            Final Selling Price
                          </div>
                          <div className="text-3xl font-semibold text-accent mt-1">
                            ₦{finalPrice.toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <Label className="mb-3 block">
                            Payment Options *
                          </Label>
                          <div className="space-y-2">
                            {["Full", "Installment", "Stage-based"].map(
                              (option) => (
                                <div
                                  key={option}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={option}
                                    checked={formData.paymentOptions.includes(
                                      option,
                                    )}
                                    onCheckedChange={() =>
                                      togglePaymentOption(option)
                                    }
                                  />
                                  <label
                                    htmlFor={option}
                                    className="text-sm cursor-pointer"
                                  >
                                    {option} Payment
                                  </label>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {/* Installment Configuration - shown only if Installment is selected */}
                        {formData.paymentOptions.includes("Installment") && (
                          <div className="p-4 bg-muted rounded-lg space-y-4">
                            <h4 className="text-sm font-medium">
                              Installment Configuration
                            </h4>

                            <div>
                              <Label htmlFor="downPaymentAmount">
                                Down Payment Amount (₦) *
                              </Label>
                              <Input
                                id="downPaymentAmount"
                                type="number"
                                value={formData.downPaymentAmount}
                                onChange={(e) =>
                                  updateFormData(
                                    "downPaymentAmount",
                                    e.target.value,
                                  )
                                }
                                placeholder="5000000"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Minimum initial payment required
                              </p>
                            </div>

                            <div>
                              <Label className="mb-3 block">
                                Allowed Payment Periods *
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                {paymentPeriods.map((period) => (
                                  <div
                                    key={period}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={period}
                                      checked={formData.installmentPeriods.includes(
                                        period,
                                      )}
                                      onCheckedChange={() =>
                                        toggleInstallmentPeriod(period)
                                      }
                                    />
                                    <label
                                      htmlFor={period}
                                      className="text-sm cursor-pointer"
                                    >
                                      {period}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.developmentStage ===
                        "Before Development" ? (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium mb-1">
                              Pre-Development Discounts
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Incentives that apply while the asset is still
                              being built
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {formData.type === "Off Plan" && (
                                <div>
                                  <Label htmlFor="offPlanDiscount">
                                    Off-plan Discount (%)
                                  </Label>
                                  <Input
                                    id="offPlanDiscount"
                                    type="number"
                                    step="0.1"
                                    value={formData.offPlanDiscount}
                                    onChange={(e) =>
                                      updateFormData(
                                        "offPlanDiscount",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="10"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Early-bird price for pre-completion sales
                                  </p>
                                </div>
                              )}
                              {(formData.type === "Off Plan" ||
                                formData.type === "Under Construction") && (
                                <div>
                                  <Label htmlFor="stageBasedDiscount">
                                    Stage-based Discount (%)
                                  </Label>
                                  <Input
                                    id="stageBasedDiscount"
                                    type="number"
                                    step="0.1"
                                    value={formData.stageBasedDiscount}
                                    onChange={(e) =>
                                      updateFormData(
                                        "stageBasedDiscount",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="5"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Reward for buying at an earlier build stage
                                  </p>
                                </div>
                              )}
                              {formData.type === "Land" && (
                                <div className="col-span-2 p-3 bg-background rounded border text-xs text-muted-foreground">
                                  Land parcels are priced per sqm / plot —
                                  volume and deal-level discounts are agreed
                                  case by case.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium mb-1">
                              Market Pricing
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Post-development assets are priced against
                              verified market value — off-plan and
                              construction-stage discounts do not apply.
                            </p>
                          </div>
                        )}

                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <CircleCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-900 dark:text-blue-100">
                            <strong>Payment Security:</strong> All payments are
                            processed through escrow accounts with full investor
                            protection and transparent transaction tracking.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Returns & Projections */}
                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="projectedRentalIncome">
                              Projected Rental Income (₦) *
                            </Label>
                            <Input
                              id="projectedRentalIncome"
                              type="number"
                              value={formData.projectedRentalIncome}
                              onChange={(e) =>
                                updateFormData(
                                  "projectedRentalIncome",
                                  e.target.value,
                                )
                              }
                              placeholder="75000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="rentalFrequency">
                              Rental Frequency *
                            </Label>
                            <Select
                              value={formData.rentalFrequency}
                              onValueChange={(val) =>
                                updateFormData("rentalFrequency", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {rentalFrequencies.map((freq) => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="operatingCost">
                            Operating Cost Assumptions (₦/year) *
                          </Label>
                          <Input
                            id="operatingCost"
                            type="number"
                            value={formData.operatingCost}
                            onChange={(e) =>
                              updateFormData("operatingCost", e.target.value)
                            }
                            placeholder="15000"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Include maintenance, management fees, and utilities
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="capitalAppreciation">
                              Capital Appreciation (% p.a.) *
                            </Label>
                            <Input
                              id="capitalAppreciation"
                              type="number"
                              step="0.1"
                              value={formData.capitalAppreciation}
                              onChange={(e) =>
                                updateFormData(
                                  "capitalAppreciation",
                                  e.target.value,
                                )
                              }
                              placeholder="8.0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="firstPayoutDate">
                              First Payout Date
                            </Label>
                            <Input
                              id="firstPayoutDate"
                              type="date"
                              value={formData.firstPayoutDate}
                              onChange={(e) =>
                                updateFormData(
                                  "firstPayoutDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg space-y-3">
                          <h4 className="text-sm font-medium text-accent">
                            Calculated Returns
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Rental Yield
                              </div>
                              <div className="text-xl font-semibold text-accent">
                                {rentalYield}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Capital Growth
                              </div>
                              <div className="text-xl font-semibold text-accent">
                                {formData.capitalAppreciation || 0}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Total Annual Return
                              </div>
                              <div className="text-xl font-semibold text-accent">
                                {totalAnnualReturn}%
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Investment Returns Ranges */}
                        <div className="p-4 bg-muted rounded-lg space-y-4">
                          <h4 className="text-sm font-medium">
                            Projected Investment Returns (Range)
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Define the expected range of returns for investor
                            transparency
                          </p>

                          <div className="space-y-4">
                            <div>
                              <Label className="mb-2 block">
                                Rental Yield Range (%)
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.rentalYieldMin}
                                    onChange={(e) =>
                                      updateFormData(
                                        "rentalYieldMin",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Min (e.g., 8)"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.rentalYieldMax}
                                    onChange={(e) =>
                                      updateFormData(
                                        "rentalYieldMax",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Max (e.g., 10)"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Annual rental income as percentage of property
                                value
                              </p>
                            </div>

                            <div>
                              <Label className="mb-2 block">
                                Capital Appreciation Range (%)
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.capitalAppreciationMin}
                                    onChange={(e) =>
                                      updateFormData(
                                        "capitalAppreciationMin",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Min (e.g., 15)"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.capitalAppreciationMax}
                                    onChange={(e) =>
                                      updateFormData(
                                        "capitalAppreciationMax",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Max (e.g., 20)"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Expected property value growth per annum
                              </p>
                            </div>

                            <div>
                              <Label className="mb-2 block">
                                Total Returns Range (%)
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.totalReturnsMin}
                                    onChange={(e) =>
                                      updateFormData(
                                        "totalReturnsMin",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Min (e.g., 23)"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.totalReturnsMax}
                                    onChange={(e) =>
                                      updateFormData(
                                        "totalReturnsMax",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Max (e.g., 30)"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Combined annual returns (rental + appreciation)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Risk & Transparency */}
                    {currentStep === 6 && (
                      <div className="space-y-4">
                        {/* Construction Progress — pre-development builds only, never for raw land */}
                        {formData.developmentStage === "Before Development" &&
                          formData.type !== "Land" && (
                            <div>
                              <Label htmlFor="constructionProgress">
                                Construction Progress (%)
                              </Label>
                              <Input
                                id="constructionProgress"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.constructionProgress}
                                onChange={(e) =>
                                  updateFormData(
                                    "constructionProgress",
                                    e.target.value,
                                  )
                                }
                                placeholder="70"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Current completion percentage of the project
                              </p>
                            </div>
                          )}

                        <div>
                          <Label>Risk Level *</Label>
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            {["Low", "Medium", "High"].map((level) => (
                              <div
                                key={level}
                                onClick={() =>
                                  updateFormData("riskLevel", level)
                                }
                                className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                  formData.riskLevel === level
                                    ? level === "Low"
                                      ? "border-accent bg-accent/10 text-accent"
                                      : level === "Medium"
                                        ? "border-warning bg-warning/10 text-warning"
                                        : "border-destructive bg-destructive/10 text-destructive"
                                    : "border-border hover:border-muted-foreground"
                                }`}
                              >
                                <div className="font-medium">{level}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Factors */}
                        <div className="p-4 bg-muted rounded-lg space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Investment Risk Factors
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Select applicable risk factors for investor
                              transparency
                            </p>
                          </div>

                          <div className="space-y-2">
                            {presetRiskFactors.map((factor) => (
                              <div
                                key={factor}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={factor}
                                  checked={formData.riskFactors.includes(
                                    factor,
                                  )}
                                  onCheckedChange={() =>
                                    toggleRiskFactor(factor)
                                  }
                                />
                                <label
                                  htmlFor={factor}
                                  className="text-sm cursor-pointer leading-tight"
                                >
                                  {factor}
                                </label>
                              </div>
                            ))}
                          </div>

                          {/* Custom Risk Factor */}
                          <div>
                            <Label
                              htmlFor="customRiskFactor"
                              className="text-xs"
                            >
                              Add Custom Risk Factor
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                id="customRiskFactor"
                                value={formData.customRiskFactor}
                                onChange={(e) =>
                                  updateFormData(
                                    "customRiskFactor",
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter custom risk factor"
                                className="text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCustomRiskFactor();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addCustomRiskFactor}
                              >
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Display selected custom risk factors */}
                          {formData.riskFactors.filter(
                            (f) => !presetRiskFactors.includes(f),
                          ).length > 0 && (
                            <div>
                              <Label className="text-xs mb-2 block">
                                Custom Risk Factors:
                              </Label>
                              <div className="space-y-2">
                                {formData.riskFactors
                                  .filter(
                                    (f) => !presetRiskFactors.includes(f),
                                  )
                                  .map((factor) => (
                                    <div
                                      key={factor}
                                      className="flex items-center justify-between p-2 bg-background rounded border text-sm"
                                    >
                                      <span>{factor}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRiskFactor(factor)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {formData.type === "Off Plan" && (
                          <div>
                            <Label htmlFor="offPlanSecurity">
                              Off-plan Security Notes
                            </Label>
                            <Textarea
                              id="offPlanSecurity"
                              value={formData.offPlanSecurity}
                              onChange={(e) =>
                                updateFormData(
                                  "offPlanSecurity",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Developer escrow account + Bank guarantee"
                              rows={3}
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="exitLiquidity">
                            Exit Liquidity Settings *
                          </Label>
                          <Select
                            value={formData.exitLiquidity}
                            onValueChange={(val) =>
                              updateFormData("exitLiquidity", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">
                                High - Can exit within 30 days
                              </SelectItem>
                              <SelectItem value="Medium">
                                Medium - Exit within 60-90 days
                              </SelectItem>
                              <SelectItem value="Low">
                                Low - Exit after 6+ months
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="managementMode">
                            Management Mode *
                          </Label>
                          <Select
                            value={formData.managementMode}
                            onValueChange={(val) =>
                              updateFormData("managementMode", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={`${formData.platform}-managed`}>
                                {formData.platform}-managed
                              </SelectItem>
                              <SelectItem value="Self-managed">
                                Self-managed
                              </SelectItem>
                              <SelectItem value="Third-party managed">
                                Third-party managed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <CircleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>Transparency Notice:</strong> All risk
                            factors, construction progress, and financial
                            projections are regularly updated and verified by
                            independent auditors.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 7: Media & Documentation */}
                    {currentStep === 7 && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h4 className="font-medium mb-1">Upload Images</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            High-quality photos of the property
                          </p>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            Choose Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formData.images > 0
                              ? `${formData.images} images uploaded`
                              : "No images uploaded yet"}
                          </p>
                          {uploadedImages.length > 0 && (
                            <div className="mt-4 space-y-2 text-left">
                              {uploadedImages.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                  <span className="truncate flex-1">
                                    {file.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
                          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h4 className="font-medium mb-1">Upload Documents</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Legal documents, floor plans, certificates
                          </p>
                          <input
                            ref={documentInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            multiple
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => documentInputRef.current?.click()}
                          >
                            Choose Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formData.documents > 0
                              ? `${formData.documents} documents uploaded`
                              : "No documents uploaded yet"}
                          </p>
                          {uploadedDocuments.length > 0 && (
                            <div className="mt-4 space-y-2 text-left">
                              {uploadedDocuments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                  <span className="truncate flex-1">
                                    {file.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
                          <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h4 className="font-medium mb-1">
                            Virtual Tour Links
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Add 360° virtual tours or video walkthroughs
                          </p>
                          <Input
                            placeholder="https://..."
                            className="mt-2 max-w-md mx-auto"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            {formData.virtualTours > 0
                              ? `${formData.virtualTours} tours added`
                              : "No virtual tours added yet"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 8: Commission Setup */}
                    {currentStep === 8 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-1">
                            Commission Structure
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Set commission percentages for agents involved in
                            the sale
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="leadCommission">
                              Lead Commission (%) *
                            </Label>
                            <Input
                              id="leadCommission"
                              type="number"
                              step="0.1"
                              value={formData.leadCommission}
                              onChange={(e) =>
                                updateFormData("leadCommission", e.target.value)
                              }
                              placeholder="1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="closerCommission">
                              Deal Closer Commission (%) *
                            </Label>
                            <Input
                              id="closerCommission"
                              type="number"
                              step="0.1"
                              value={formData.closerCommission}
                              onChange={(e) =>
                                updateFormData(
                                  "closerCommission",
                                  e.target.value,
                                )
                              }
                              placeholder="1.5"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Total Commission
                              </div>
                              <div className="text-2xl font-semibold text-accent">
                                {totalCommission.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Commission per Sale
                              </div>
                              <div className="text-2xl font-semibold text-accent">
                                ₦
                                {(
                                  (finalPrice * totalCommission) /
                                  100
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Based on final selling price of ₦
                            {finalPrice.toLocaleString()}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="text-sm">Lead Agent Earns:</span>
                            <span className="font-semibold">
                              ₦
                              {(
                                (finalPrice *
                                  (parseFloat(formData.leadCommission) || 0)) /
                                100
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="text-sm">Closer Agent Earns:</span>
                            <span className="font-semibold">
                              ₦
                              {(
                                (finalPrice *
                                  (parseFloat(formData.closerCommission) ||
                                    0)) /
                                100
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 9: Review & Publish */}
                    {currentStep === 9 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-semibold text-lg mb-4">
                            Asset Summary
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Asset Name:
                              </span>
                              <span className="font-medium text-right">
                                {formData.name || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Reference Code:
                              </span>
                              <span className="font-medium">
                                {formData.referenceCode || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Type:
                              </span>
                              <Badge variant="outline">
                                {formData.type.toUpperCase() || "—"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Development Stage:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  formData.developmentStage ===
                                  "Before Development"
                                    ? "border-amber-500 text-amber-600 bg-amber-50"
                                    : "border-emerald-500 text-emerald-600 bg-emerald-50"
                                }
                              >
                                {formData.developmentStage}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Investment Program:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  isHarbor
                                    ? "border-purple-500 text-purple-600 bg-purple-50"
                                    : "border-blue-500 text-blue-600 bg-blue-50"
                                }
                              >
                                {formData.platform}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Location:
                              </span>
                              <span className="font-medium text-right">
                                {formData.location || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Property Category:
                              </span>
                              <span className="font-medium">
                                {formData.propertyCategory || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Total Units:
                              </span>
                              <span className="font-medium">
                                {formData.totalUnits || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                          <h4 className="font-medium text-accent mb-3">
                            Financial Summary
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Final Selling Price:
                              </span>
                              <span className="font-semibold">
                                ₦{finalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Ownership Type:</span>
                              <span className="font-medium">
                                {formData.ownershipType}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Total Annual Return:
                              </span>
                              <span className="font-semibold text-accent">
                                {totalAnnualReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total Commission:</span>
                              <span className="font-semibold">
                                {totalCommission.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Investment Returns Summary */}
                        {(formData.rentalYieldMin ||
                          formData.rentalYieldMax ||
                          formData.capitalAppreciationMin ||
                          formData.capitalAppreciationMax ||
                          formData.totalReturnsMin ||
                          formData.totalReturnsMax) && (
                          <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                            <h4 className="font-medium text-accent mb-3">
                              Investment Returns (Projected Ranges)
                            </h4>
                            <div className="space-y-2">
                              {(formData.rentalYieldMin ||
                                formData.rentalYieldMax) && (
                                <div className="flex justify-between">
                                  <span className="text-sm">Rental Yield:</span>
                                  <span className="font-semibold">
                                    {formData.rentalYieldMin || "—"}-
                                    {formData.rentalYieldMax || "—"}%
                                  </span>
                                </div>
                              )}
                              {(formData.capitalAppreciationMin ||
                                formData.capitalAppreciationMax) && (
                                <div className="flex justify-between">
                                  <span className="text-sm">
                                    Capital Appreciation:
                                  </span>
                                  <span className="font-semibold">
                                    {formData.capitalAppreciationMin || "—"}-
                                    {formData.capitalAppreciationMax || "—"}%
                                  </span>
                                </div>
                              )}
                              {(formData.totalReturnsMin ||
                                formData.totalReturnsMax) && (
                                <div className="flex justify-between">
                                  <span className="text-sm">
                                    Total Returns:
                                  </span>
                                  <span className="font-semibold text-accent">
                                    {formData.totalReturnsMin || "—"}-
                                    {formData.totalReturnsMax || "—"}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-3">
                            Risk & Management
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Project Status:</span>
                              <span className="font-medium">
                                {formData.projectStatus || "—"}
                                {formData.type !== "Land" &&
                                  formData.constructionProgress &&
                                  formData.projectStatus !== "Completed" &&
                                  formData.projectStatus !== "Available" &&
                                  ` (${formData.constructionProgress}% complete)`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Risk Level:</span>
                              <Badge
                                variant="outline"
                                className={
                                  formData.riskLevel === "Low"
                                    ? "border-accent text-accent"
                                    : formData.riskLevel === "Medium"
                                      ? "border-warning text-warning"
                                      : "border-destructive text-destructive"
                                }
                              >
                                {formData.riskLevel}
                              </Badge>
                            </div>
                            {formData.riskFactors.length > 0 && (
                              <div>
                                <span className="text-sm text-muted-foreground block mb-1">
                                  Risk Factors:
                                </span>
                                <ul className="text-sm space-y-1 ml-4">
                                  {formData.riskFactors
                                    .slice(0, 3)
                                    .map((factor, idx) => (
                                      <li key={idx} className="list-disc">
                                        {factor}
                                      </li>
                                    ))}
                                  {formData.riskFactors.length > 3 && (
                                    <li className="text-muted-foreground">
                                      +{formData.riskFactors.length - 3} more
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-sm">Exit Liquidity:</span>
                              <span className="font-medium">
                                {formData.exitLiquidity}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Management:</span>
                              <span className="font-medium">
                                {formData.managementMode}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">
                              Publish Status
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Toggle to publish asset immediately
                            </p>
                          </div>
                          <Switch
                            checked={formData.status === "published"}
                            onCheckedChange={(val) =>
                              updateFormData(
                                "status",
                                val ? "published" : "draft",
                              )
                            }
                          />
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-green-900 dark:text-green-100">
                            Review all details carefully before publishing. You
                            can always edit or unpublish the asset later.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Controls */}
                  <DialogFooter className="p-6 pt-4 border-t bg-muted/20">
                    <div className="flex items-center justify-between w-full">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSubmit("draft")}
                          disabled={loading}
                        >
                          Save Draft
                        </Button>
                        {currentStep < 4 ? (
                          <Button onClick={nextStep}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleSubmit("published")}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Publish Asset
                          </Button>
                        )}
                      </div>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filter Bar Controls */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Application
                </Label>
                <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Applications</SelectItem>
                    <SelectItem value="Urbco Foundry">Urbco Foundry</SelectItem>
                    <SelectItem value="Urbco Harbor">Urbco Harbor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Stage
                </Label>
                <Select value={filterDevelopmentStage} onValueChange={setFilterDevelopmentStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Before Development">Before Development</SelectItem>
                    <SelectItem value="After Development">After Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Asset Type
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {assetTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Status
                </Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {assetStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {String(s).toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Location
                </Label>
                <Select value={filterLocation} onValueChange={setFilterLocation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Company
                </Label>
                <Select value={filterCompany} onValueChange={setFilterCompany}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assets Listing ({filteredAssets.length})</CardTitle>
            <div className="text-xs text-muted-foreground flex gap-4">
              <span>
                {filteredAssets.filter((a) => (a.developmentStage || "Before Development") === "Before Development").length} BEFORE DEV
              </span>
              <span>
                {filteredAssets.filter((a) => a.developmentStage === "After Development").length} AFTER DEV
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Application</TableHead>
                  <TableHead>Development Stage</TableHead>
                  <TableHead>Asset Info</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Final Price / Value</TableHead>
                  <TableHead>Returns</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssets.map((asset) => {
                  const isFoundry = (asset.platform || "Urbco Foundry") === "Urbco Foundry";
                  const isBeforeDev = (asset.developmentStage || "Before Development") === "Before Development";

                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isFoundry
                              ? "border-blue-500 text-blue-700 bg-blue-50"
                              : "border-purple-500 text-purple-700 bg-purple-50"
                          }
                        >
                          {asset.platform || "Urbco Foundry"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            isBeforeDev
                              ? "border-amber-500 text-amber-700 bg-amber-50"
                              : "border-emerald-500 text-emerald-700 bg-emerald-50"
                          }
                        >
                          {asset.developmentStage || "Before Development"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div>
                          <span className="font-semibold text-sm">{asset.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {asset.company?.name || "Partner Developer"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {asset.type}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm">{asset.location}</TableCell>

                      <TableCell className="font-semibold text-sm">
                        ₦{Number(asset.finalPrice || asset.price || 0).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        <div className="text-sm">
                          <span className="font-bold text-emerald-600">
                            {asset.totalReturnsMax || asset.totalAnnualReturn || "15.0"}%
                          </span>
                          <div className="text-[10px] text-muted-foreground uppercase">
                            {isBeforeDev ? "Projected ROI" : "Actual Cashflow"}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={asset.status === "active" || asset.status === "published" ? "default" : "secondary"}
                        >
                          {asset.status || "active"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(asset.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(asset.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(asset.id)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Asset Detail Modal */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">{viewAsset?.name}</DialogTitle>
                <DialogDescription>{viewAsset?.location}</DialogDescription>
              </div>
              <div className="flex gap-2">
                <Badge className="bg-blue-100 text-blue-800">{viewAsset?.platform}</Badge>
                <Badge className="bg-amber-100 text-amber-800">{viewAsset?.developmentStage}</Badge>
              </div>
            </div>
          </DialogHeader>

          {viewAsset && (
            <div className="space-y-6 pt-4 text-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-xl">
                <div>
                  <span className="text-xs text-muted-foreground block">Final Price</span>
                  <span className="font-bold text-base">₦{Number(viewAsset.finalPrice || viewAsset.price || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Category</span>
                  <span className="font-semibold">{viewAsset.propertyCategory || viewAsset.type}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Developer</span>
                  <span className="font-semibold">{viewAsset.company?.name || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Return Metric</span>
                  <span className="font-bold text-emerald-600">{viewAsset.totalReturnsMax || viewAsset.totalAnnualReturn || "15"}%</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold border-b pb-1 mb-2">Description</h4>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {viewAsset.description || "No specific overview provided for this asset."}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset? Action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              Delete Asset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

              {/* Edit Asset Dialog - Reuses same form structure */}
              <Dialog
                open={editDialogOpen}
                onOpenChange={(open) => {
                  setEditDialogOpen(open);
                  if (!open) {
                    setFormData(INITIAL_FORM_DATA);
                    setCurrentStep(1);
                    setMarkupPct("");
                    setCustomPctInput("");
                    setError(null);
                  }
                }}
              >
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader>
                    <DialogTitle>Edit Asset</DialogTitle>
                    <DialogDescription>
                      Step {currentStep} of {totalSteps}:{" "}
                      {currentStep === 1
                        ? "Asset Identity & Status"
                        : currentStep === 2
                          ? "Physical Details & Facilities"
                          : currentStep === 3
                            ? "Investment Program & Structure"
                            : currentStep === 4
                              ? "Pricing Logic"
                              : currentStep === 5
                                ? "Returns Projections"
                                : currentStep === 6
                                  ? "Risk & Management Assessment"
                                  : currentStep === 7
                                    ? "Media & Documentation"
                                    : currentStep === 8
                                      ? "Commission Setup"
                                      : "Review & Publish"}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={
                          formData.developmentStage === "Before Development"
                            ? "border-amber-500 text-amber-600 bg-amber-50"
                            : "border-emerald-500 text-emerald-600 bg-emerald-50"
                        }
                      >
                        {formData.developmentStage}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          isHarbor
                            ? "border-purple-500 text-purple-600 bg-purple-50"
                            : "border-blue-500 text-blue-600 bg-blue-50"
                        }
                      >
                        {formData.platform}
                      </Badge>
                    </div>
                  </DialogHeader>

                  {/* Use the same form steps - content is identical to create dialog */}
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {/* The form fields below are populated with existing asset data through formData state */}
                    {/* All form steps from create dialog are rendered here with the same formData binding */}

                    {/* Step 1: Asset Identity & Status */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        {/* Development Stage — compact segmented toggle */}
                        <div>
                          <Label className="mb-2 block">
                            Development Stage *
                          </Label>
                          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                            {STAGE_OPTIONS.map((stage) => {
                              const selected =
                                formData.developmentStage === stage.value;
                              const Icon = stage.icon;
                              return (
                                <button
                                  key={stage.value}
                                  type="button"
                                  onClick={() => handleStageChange(stage)}
                                  className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left transition-colors cursor-pointer ${
                                    selected
                                      ? "bg-background shadow-sm border border-border"
                                      : "hover:bg-background/60 border border-transparent"
                                  }`}
                                >
                                  <Icon
                                    className={`h-4 w-4 shrink-0 ${
                                      selected
                                        ? isBeforeDev
                                          ? "text-amber-600"
                                          : "text-emerald-600"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <div
                                      className={`text-sm font-medium ${
                                        selected
                                          ? ""
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {stage.label}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate">
                                      {stage.sub}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          {/* Stage context — what this stage means */}
                          <div
                            className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
                              isBeforeDev
                                ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                                : "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                            }`}
                          >
                            <div className="min-w-0">
                              <p
                                className={`text-xs leading-relaxed ${
                                  isBeforeDev
                                    ? "text-amber-900 dark:text-amber-100"
                                    : "text-emerald-900 dark:text-emerald-100"
                                }`}
                              >
                                {stageConfig.description}
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {stageConfig.chips.map((chip) => (
                                  <span
                                    key={chip}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      isBeforeDev
                                        ? "bg-amber-100/70 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200"
                                        : "bg-emerald-100/70 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200"
                                    }`}
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-name">Asset Name *</Label>
                            <Input
                              id="edit-name"
                              value={formData.name}
                              onChange={(e) =>
                                updateFormData("name", e.target.value)
                              }
                              placeholder="e.g., Marina Heights Tower A"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-referenceCode">
                              Asset Reference Code *
                            </Label>
                            <Input
                              id="edit-referenceCode"
                              value={formData.referenceCode}
                              onChange={(e) =>
                                updateFormData("referenceCode", e.target.value)
                              }
                              placeholder="e.g., MHT-A-2024"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-type">Asset Type *</Label>
                            <Select
                              value={formData.type}
                              onValueChange={(val) =>
                                updateFormData("type", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                {stageTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isBeforeDev
                                ? "Pre-development assets: land, off-plan units or active construction"
                                : "Post-development assets: built and ready for occupation or use"}
                            </p>
                          </div>
                          <div>
                            <Label htmlFor="edit-projectStatus">
                              Project Status *
                            </Label>
                            <Select
                              value={formData.projectStatus}
                              onValueChange={(val) =>
                                updateFormData("projectStatus", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                {stageStatuses.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {isBeforeDev
                                ? "Where the project sits in the development pipeline"
                                : "Sales / occupancy state of the completed asset"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-location">Location *</Label>
                          <Input
                            id="edit-location"
                            value={formData.location}
                            onChange={(e) =>
                              updateFormData("location", e.target.value)
                            }
                            placeholder="e.g., Dubai Marina"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-address">Full Address *</Label>
                          <Textarea
                            id="edit-address"
                            value={formData.address}
                            onChange={(e) =>
                              updateFormData("address", e.target.value)
                            }
                            placeholder="Enter complete address with plot/unit details"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-company">Company *</Label>
                          <Select
                            value={formData.company}
                            onValueChange={(val) =>
                              updateFormData("company", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-landSize">
                              Land Size (sqm)
                            </Label>
                            <Input
                              id="edit-landSize"
                              type="number"
                              value={formData.landSize}
                              onChange={(e) =>
                                updateFormData("landSize", e.target.value)
                              }
                              placeholder="5000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-builtSize">
                              Built-up Size (sqm)
                            </Label>
                            <Input
                              id="edit-builtSize"
                              type="number"
                              value={formData.builtSize}
                              onChange={(e) =>
                                updateFormData("builtSize", e.target.value)
                              }
                              placeholder="45000"
                            />
                          </div>
                        </div>

                        {/* Show construction dates only if not Land or Completed */}
                        {formData.type !== "Land" &&
                          formData.type !== "Completed" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-constructionStart">
                                  Construction Start Date
                                </Label>
                                <Input
                                  id="edit-constructionStart"
                                  type="date"
                                  value={formData.constructionStart}
                                  onChange={(e) =>
                                    updateFormData(
                                      "constructionStart",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-constructionEnd">
                                  Expected Completion Date
                                </Label>
                                <Input
                                  id="edit-constructionEnd"
                                  type="date"
                                  value={formData.constructionEnd}
                                  onChange={(e) =>
                                    updateFormData(
                                      "constructionEnd",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* Step 2: Physical & Functional Details */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-propertyCategory">
                            Property Category *
                          </Label>
                          <Select
                            value={formData.propertyCategory}
                            onValueChange={(val) =>
                              updateFormData("propertyCategory", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Residential">
                                Residential
                              </SelectItem>
                              <SelectItem value="Commercial">
                                Commercial
                              </SelectItem>
                              <SelectItem value="Mixed-use">
                                Mixed-use
                              </SelectItem>
                              <SelectItem value="Land">Land</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-totalUnits">
                              Total Units / Rooms *
                            </Label>
                            <Input
                              id="edit-totalUnits"
                              type="number"
                              value={formData.totalUnits}
                              onChange={(e) =>
                                updateFormData("totalUnits", e.target.value)
                              }
                              placeholder="156"
                            />
                          </div>
                          <div>
                            <Label className="mb-2 block">
                              Unit Configuration *
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                "Studio Apartment",
                                "1 Bedroom",
                                "2 Bedrooms",
                                "3 Bedrooms",
                                "4 Bedrooms",
                                "5 Bedrooms",
                              ].map((config) => (
                                <div
                                  key={config}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`edit-unit-${config}`}
                                    checked={(
                                      formData.unitConfiguration as string[]
                                    ).includes(config)}
                                    onCheckedChange={() =>
                                      toggleUnitConfig(config)
                                    }
                                  />
                                  <label
                                    htmlFor={`edit-unit-${config}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {config}
                                  </label>
                                </div>
                              ))}
                              {(formData.unitConfiguration as string[])
                                .filter(
                                  (c) =>
                                    ![
                                      "Studio Apartment",
                                      "1 Bedroom",
                                      "2 Bedrooms",
                                      "3 Bedrooms",
                                      "4 Bedrooms",
                                      "5 Bedrooms",
                                    ].includes(c),
                                )
                                .map((config) => (
                                  <div
                                    key={config}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`edit-unit-custom-${config}`}
                                      checked
                                      onCheckedChange={() =>
                                        toggleUnitConfig(config)
                                      }
                                    />
                                    <label
                                      htmlFor={`edit-unit-custom-${config}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {config}
                                    </label>
                                  </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Input
                                value={customUnitInput}
                                onChange={(e) =>
                                  setCustomUnitInput(e.target.value)
                                }
                                placeholder="Add custom type"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (customUnitInput.trim()) {
                                    toggleUnitConfig(customUnitInput.trim());
                                    setCustomUnitInput("");
                                  }
                                }}
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-furnishingStatus">
                            Furnishing Status *
                          </Label>
                          <Select
                            value={formData.furnishingStatus}
                            onValueChange={(val) =>
                              updateFormData("furnishingStatus", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Unfurnished">
                                Unfurnished
                              </SelectItem>
                              <SelectItem value="Semi-furnished">
                                Semi-furnished
                              </SelectItem>
                              <SelectItem value="Fully furnished">
                                Fully furnished
                              </SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="mb-3 block">
                            Shared Facilities
                          </Label>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              "Pool",
                              "Gym",
                              "Parking",
                              "Security",
                              "Private Beach",
                              "Spa",
                              "Retail",
                              "Meeting Rooms",
                              "Elevators",
                            ].map((facility) => (
                              <div
                                key={facility}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`edit-${facility}`}
                                  checked={formData.sharedFacilities.includes(
                                    facility,
                                  )}
                                  onCheckedChange={() =>
                                    toggleFacility(facility)
                                  }
                                />
                                <label
                                  htmlFor={`edit-${facility}`}
                                  className="text-sm cursor-pointer"
                                >
                                  {facility}
                                </label>
                              </div>
                            ))}
                            {formData.sharedFacilities
                              .filter(
                                (f) =>
                                  ![
                                    "Pool",
                                    "Gym",
                                    "Parking",
                                    "Security",
                                    "Private Beach",
                                    "Spa",
                                    "Retail",
                                    "Meeting Rooms",
                                    "Elevators",
                                  ].includes(f),
                              )
                              .map((customF) => (
                                <div
                                  key={customF}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`edit-custom-${customF}`}
                                    checked
                                    onCheckedChange={() =>
                                      toggleFacility(customF)
                                    }
                                  />
                                  <label
                                    htmlFor={`edit-custom-${customF}`}
                                    className="text-sm cursor-pointer"
                                  >
                                    {customF}
                                  </label>
                                </div>
                              ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Input
                              value={customFacilityInput}
                              onChange={(e) =>
                                setCustomFacilityInput(e.target.value)
                              }
                              placeholder="Add custom facility"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (customFacilityInput.trim()) {
                                  toggleFacility(customFacilityInput.trim());
                                  setCustomFacilityInput("");
                                }
                              }}
                            >
                              Add
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">
                              Facility Management Included
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Is professional facility management included?
                            </p>
                          </div>
                          <Switch
                            checked={formData.facilityManagement}
                            onCheckedChange={(val) =>
                              updateFormData("facilityManagement", val)
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* Step 3: Investment Program & Structure */}
                    {currentStep === 3 && (
                      <div className="space-y-4">
                        {/* Investment Program */}
                        <div>
                          <Label className="text-base font-semibold mb-1 block">
                            Investment Program *
                          </Label>
                          <p className="text-xs text-muted-foreground mb-2">
                            Defines the kind of investment this asset carries —
                            it shapes ownership structures, funding terms,
                            returns and risk disclosure in the steps that
                            follow.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {PROGRAM_OPTIONS.map((program) => {
                              const selected =
                                formData.platform === program.value;
                              const Icon = program.icon;
                              return (
                                <div
                                  key={program.value}
                                  onClick={() =>
                                    handleProgramChange(program.value)
                                  }
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    selected
                                      ? program.value === "Urbco Harbor"
                                        ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20"
                                        : "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                                      : "border-border hover:border-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 mb-1.5">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        program.value === "Urbco Harbor"
                                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                      }`}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm">
                                        {program.value}
                                      </h4>
                                      <span
                                        className={`text-xs font-medium ${
                                          program.value === "Urbco Harbor"
                                            ? "text-purple-600 dark:text-purple-400"
                                            : "text-blue-600 dark:text-blue-400"
                                        }`}
                                      >
                                        {program.tag}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed">
                                    {program.description}
                                  </p>
                                  <ul className="mt-2 space-y-0.5">
                                    {program.bullets.map((b) => (
                                      <li
                                        key={b}
                                        className="text-[11px] text-muted-foreground flex items-center gap-1.5"
                                      >
                                        <span
                                          className={`w-1 h-1 rounded-full shrink-0 ${
                                            program.value === "Urbco Harbor"
                                              ? "bg-purple-500"
                                              : "bg-blue-500"
                                          }`}
                                        />
                                        {b}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <Label>Ownership Options *</Label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div
                              onClick={() =>
                                updateFormData("ownershipType", "Full")
                              }
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.ownershipType === "Full"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <h4 className="font-medium">Full Ownership</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isHarbor
                                  ? "Whole-asset acquisition by a single institutional buyer"
                                  : "Single owner purchases entire asset"}
                              </p>
                            </div>
                            <div
                              onClick={() =>
                                updateFormData("ownershipType", "Fractional")
                              }
                              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                formData.ownershipType === "Fractional"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-muted-foreground"
                              }`}
                            >
                              <h4 className="font-medium">
                                Fractional Ownership
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {isHarbor
                                  ? "Large fractional blocks sized for institutional commitments"
                                  : "Multiple investors own fractions"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* edit-Harbor — large-ticket funding parameters */}
                        {isHarbor && (
                          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Large-Ticket Funding Parameters
                              </h4>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Urbco Harbor structures stationary funding for
                                exceptionally large investments.
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-targetFunding">
                                  Total Funding Required (₦)
                                </Label>
                                <Input
                                  id="edit-targetFunding"
                                  type="number"
                                  value={formData.targetFunding}
                                  onChange={(e) =>
                                    updateFormData(
                                      "targetFunding",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="50000000000"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-minimumInvestment">
                                  Minimum Investment (₦)
                                </Label>
                                <Input
                                  id="edit-minimumInvestment"
                                  type="number"
                                  value={formData.minimumInvestment}
                                  onChange={(e) =>
                                    updateFormData(
                                      "minimumInvestment",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="10000000"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="edit-investmentType">
                                Investment Instrument
                              </Label>
                              <Select
                                value={formData.investmentType}
                                onValueChange={(val) =>
                                  updateFormData("investmentType", val)
                                }
                              >
                                <SelectTrigger id="edit-investmentType">
                                  <SelectValue placeholder="Select instrument" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Equity">
                                    Equity
                                  </SelectItem>
                                  <SelectItem value="Debt">Debt</SelectItem>
                                  <SelectItem value="Mezzanine">
                                    Mezzanine
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {formData.ownershipType === "Fractional" && (
                          <>
                            <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                              <h4 className="text-sm font-medium text-accent mb-3">
                                Fraction Breakdown
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                {formData.type === "Land" ? (
                                  <>
                                    <div>
                                      <Label htmlFor="landUnitType">
                                        Land Units *
                                      </Label>
                                      <Select
                                        id="landUnitType"
                                        value={formData.landUnitType || ""}
                                        onValueChange={(val) =>
                                          updateFormData("landUnitType", val)
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="sqm">
                                            Per Square Meter
                                          </SelectItem>
                                          <SelectItem value="plot">
                                            Per Plot
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label htmlFor="landUnitCount">
                                        Number of Units *
                                      </Label>
                                      <Input
                                        id="landUnitCount"
                                        type="number"
                                        value={formData.landUnitCount || ""}
                                        onChange={(e) =>
                                          updateFormData(
                                            "landUnitCount",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="e.g. 10"
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div>
                                      <Label htmlFor="fractionTotal">
                                        Total Fractions *
                                      </Label>
                                      <Input
                                        id="fractionTotal"
                                        type="number"
                                        value={formData.fractionTotal}
                                        onChange={(e) =>
                                          updateFormData(
                                            "fractionTotal",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="100"
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="costPerFraction">
                                        Cost per Fraction (₦) *
                                      </Label>
                                      <Input
                                        id="costPerFraction"
                                        type="number"
                                        value={formData.costPerFraction}
                                        onChange={(e) =>
                                          updateFormData(
                                            "costPerFraction",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="8500"
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Funding Progress
                                </span>
                                <span className="text-sm font-semibold">
                                  {fundingProgress}%
                                </span>
                              </div>
                              <Progress
                                value={fundingProgress}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                Auto-calculated based on fraction sales
                              </p>
                            </div>
                          </>
                        )}

                        {formData.ownershipType === "Full" && (
                          <div className="p-4 bg-muted rounded-lg text-center">
                            <CircleCheck className="h-8 w-8 mx-auto text-accent mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Full ownership selected. Asset will be sold as a
                              single unit.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Pricing & Payment Logic */}
                    {currentStep === 4 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="basePrice">
                              Base Asset Value (₦) *
                            </Label>
                            <Input
                              id="basePrice"
                              type="number"
                              value={formData.basePrice}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  basePrice: e.target.value,
                                  markup: "",
                                }));
                                setMarkupPct("");
                                setCustomPctInput("");
                                setCustomPctInput("");
                              }}
                              placeholder="1200000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="markup">BuyOps Markup *</Label>
                            <div className="space-y-2">
                              <Select
                                value={markupPct}
                                onValueChange={handleMarkupPctChange}
                              >
                                <SelectTrigger id="markup">
                                  <SelectValue placeholder="Select markup %" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "1",
                                    "2",
                                    "3",
                                    "5",
                                    "7",
                                    "10",
                                    "15",
                                    "20",
                                  ].map((pct) => (
                                    <SelectItem key={pct} value={pct}>
                                      {pct}%
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="CUSTOM">
                                    Custom %
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              {markupPct === "CUSTOM" ? (
                                <div className="space-y-1">
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      value={customPctInput}
                                      onChange={(e) =>
                                        handleCustomPctChange(e.target.value)
                                      }
                                      placeholder="Enter custom %"
                                      className="pr-8"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                      %
                                    </span>
                                  </div>
                                  {formData.markup && (
                                    <p className="text-sm text-muted-foreground">
                                      = ₦
                                      {Number(formData.markup).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                formData.markup && (
                                  <p className="text-sm text-muted-foreground">
                                    = ₦
                                    {Number(formData.markup).toLocaleString()}
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                          <div className="text-sm text-muted-foreground">
                            Final Selling Price
                          </div>
                          <div className="text-3xl font-semibold text-accent mt-1">
                            ₦{finalPrice.toLocaleString()}
                          </div>
                        </div>

                        <div>
                          <Label className="mb-3 block">
                            Payment Options *
                          </Label>
                          <div className="space-y-2">
                            {["Full", "Installment", "Stage-based"].map(
                              (option) => (
                                <div
                                  key={option}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={option}
                                    checked={formData.paymentOptions.includes(
                                      option,
                                    )}
                                    onCheckedChange={() =>
                                      togglePaymentOption(option)
                                    }
                                  />
                                  <label
                                    htmlFor={option}
                                    className="text-sm cursor-pointer"
                                  >
                                    {option} Payment
                                  </label>
                                </div>
                              ),
                            )}
                          </div>
                        </div>

                        {formData.paymentOptions.includes("Installment") && (
                          <div className="p-4 bg-muted rounded-lg space-y-4">
                            <h4 className="text-sm font-medium">
                              Installment Configuration
                            </h4>

                            <div>
                              <Label htmlFor="downPaymentAmount">
                                Down Payment Amount (₦) *
                              </Label>
                              <Input
                                id="downPaymentAmount"
                                type="number"
                                value={formData.downPaymentAmount}
                                onChange={(e) =>
                                  updateFormData(
                                    "downPaymentAmount",
                                    e.target.value,
                                  )
                                }
                                placeholder="5000000"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Minimum initial payment required
                              </p>
                            </div>

                            <div>
                              <Label className="mb-3 block">
                                Allowed Payment Periods *
                              </Label>
                              <div className="grid grid-cols-2 gap-2">
                                {paymentPeriods.map((period) => (
                                  <div
                                    key={period}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={period}
                                      checked={formData.installmentPeriods.includes(
                                        period,
                                      )}
                                      onCheckedChange={() =>
                                        toggleInstallmentPeriod(period)
                                      }
                                    />
                                    <label
                                      htmlFor={period}
                                      className="text-sm cursor-pointer"
                                    >
                                      {period}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {formData.developmentStage ===
                        "Before Development" ? (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium mb-1">
                              Pre-Development Discounts
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Incentives that apply while the asset is still
                              being built
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {formData.type === "Off Plan" && (
                                <div>
                                  <Label htmlFor="offPlanDiscount">
                                    Off-plan Discount (%)
                                  </Label>
                                  <Input
                                    id="offPlanDiscount"
                                    type="number"
                                    step="0.1"
                                    value={formData.offPlanDiscount}
                                    onChange={(e) =>
                                      updateFormData(
                                        "offPlanDiscount",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="10"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Early-bird price for pre-completion sales
                                  </p>
                                </div>
                              )}
                              {(formData.type === "Off Plan" ||
                                formData.type === "Under Construction") && (
                                <div>
                                  <Label htmlFor="stageBasedDiscount">
                                    Stage-based Discount (%)
                                  </Label>
                                  <Input
                                    id="stageBasedDiscount"
                                    type="number"
                                    step="0.1"
                                    value={formData.stageBasedDiscount}
                                    onChange={(e) =>
                                      updateFormData(
                                        "stageBasedDiscount",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="5"
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Reward for buying at an earlier build stage
                                  </p>
                                </div>
                              )}
                              {formData.type === "Land" && (
                                <div className="col-span-2 p-3 bg-background rounded border text-xs text-muted-foreground">
                                  Land parcels are priced per sqm / plot —
                                  volume and deal-level discounts are agreed
                                  case by case.
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-muted rounded-lg">
                            <h4 className="text-sm font-medium mb-1">
                              Market Pricing
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Post-development assets are priced against
                              verified market value — off-plan and
                              construction-stage discounts do not apply.
                            </p>
                          </div>
                        )}

                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <CircleCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-900 dark:text-blue-100">
                            <strong>Payment Security:</strong> All payments are
                            processed through escrow accounts with full investor
                            protection and transparent transaction tracking.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Returns & Projections */}
                    {currentStep === 5 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="projectedRentalIncome">
                              Projected Rental Income (₦) *
                            </Label>
                            <Input
                              id="projectedRentalIncome"
                              type="number"
                              value={formData.projectedRentalIncome}
                              onChange={(e) =>
                                updateFormData(
                                  "projectedRentalIncome",
                                  e.target.value,
                                )
                              }
                              placeholder="75000"
                            />
                          </div>
                          <div>
                            <Label htmlFor="rentalFrequency">
                              Rental Frequency *
                            </Label>
                            <Select
                              value={formData.rentalFrequency}
                              onValueChange={(val) =>
                                updateFormData("rentalFrequency", val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {rentalFrequencies.map((freq) => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="operatingCost">
                            Operating Cost Assumptions (₦/year) *
                          </Label>
                          <Input
                            id="operatingCost"
                            type="number"
                            value={formData.operatingCost}
                            onChange={(e) =>
                              updateFormData("operatingCost", e.target.value)
                            }
                            placeholder="15000"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Include maintenance, management fees, and utilities
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="capitalAppreciation">
                              Capital Appreciation (% p.a.) *
                            </Label>
                            <Input
                              id="capitalAppreciation"
                              type="number"
                              step="0.1"
                              value={formData.capitalAppreciation}
                              onChange={(e) =>
                                updateFormData(
                                  "capitalAppreciation",
                                  e.target.value,
                                )
                              }
                              placeholder="8.0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="firstPayoutDate">
                              First Payout Date
                            </Label>
                            <Input
                              id="firstPayoutDate"
                              type="date"
                              value={formData.firstPayoutDate}
                              onChange={(e) =>
                                updateFormData(
                                  "firstPayoutDate",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg space-y-3">
                          <h4 className="text-sm font-medium text-accent">
                            Calculated Returns
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Rental Yield
                              </div>
                              <div className="text-xl font-semibold text-accent">
                                {rentalYield}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Capital Growth
                              </div>
                              <div className="text-xl font-semibold text-accent">
                                {formData.capitalAppreciation || 0}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Total Annual Return
                              </div>
                              <div className="text-xl font-semibold text-accent">
                                {totalAnnualReturn}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg space-y-4">
                          <h4 className="text-sm font-medium">
                            Projected Investment Returns (Range)
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Define the expected range of returns for investor
                            transparency
                          </p>

                          <div className="space-y-4">
                            <div>
                              <Label className="mb-2 block">
                                Rental Yield Range (%)
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.rentalYieldMin}
                                    onChange={(e) =>
                                      updateFormData(
                                        "rentalYieldMin",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Min (e.g., 8)"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.rentalYieldMax}
                                    onChange={(e) =>
                                      updateFormData(
                                        "rentalYieldMax",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Max (e.g., 10)"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Annual rental income as percentage of property
                                value
                              </p>
                            </div>

                            <div>
                              <Label className="mb-2 block">
                                Capital Appreciation Range (%)
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.capitalAppreciationMin}
                                    onChange={(e) =>
                                      updateFormData(
                                        "capitalAppreciationMin",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Min (e.g., 15)"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.capitalAppreciationMax}
                                    onChange={(e) =>
                                      updateFormData(
                                        "capitalAppreciationMax",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Max (e.g., 20)"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Expected property value growth per annum
                              </p>
                            </div>

                            <div>
                              <Label className="mb-2 block">
                                Total Returns Range (%)
                              </Label>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.totalReturnsMin}
                                    onChange={(e) =>
                                      updateFormData(
                                        "totalReturnsMin",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Min (e.g., 23)"
                                  />
                                </div>
                                <div>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.totalReturnsMax}
                                    onChange={(e) =>
                                      updateFormData(
                                        "totalReturnsMax",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Max (e.g., 30)"
                                  />
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Combined annual returns (rental + appreciation)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 6: Risk & Transparency */}
                    {currentStep === 6 && (
                      <div className="space-y-4">
                        {formData.developmentStage === "Before Development" &&
                          formData.type !== "Land" && (
                            <div>
                              <Label htmlFor="constructionProgress">
                                Construction Progress (%)
                              </Label>
                              <Input
                                id="constructionProgress"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.constructionProgress}
                                onChange={(e) =>
                                  updateFormData(
                                    "constructionProgress",
                                    e.target.value,
                                  )
                                }
                                placeholder="70"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Current completion percentage of the project
                              </p>
                            </div>
                          )}

                        <div>
                          <Label>Risk Level *</Label>
                          <div className="grid grid-cols-3 gap-3 mt-2">
                            {["Low", "Medium", "High"].map((level) => (
                              <div
                                key={level}
                                onClick={() =>
                                  updateFormData("riskLevel", level)
                                }
                                className={`p-3 border-2 rounded-lg cursor-pointer text-center transition-all ${
                                  formData.riskLevel === level
                                    ? level === "Low"
                                      ? "border-accent bg-accent/10 text-accent"
                                      : level === "Medium"
                                        ? "border-warning bg-warning/10 text-warning"
                                        : "border-destructive bg-destructive/10 text-destructive"
                                    : "border-border hover:border-muted-foreground"
                                }`}
                              >
                                <div className="font-medium">{level}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-muted rounded-lg space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Investment Risk Factors
                            </h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              Select applicable risk factors for investor
                              transparency
                            </p>
                          </div>

                          <div className="space-y-2">
                            {presetRiskFactors.map((factor) => (
                              <div
                                key={factor}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={factor}
                                  checked={formData.riskFactors.includes(
                                    factor,
                                  )}
                                  onCheckedChange={() =>
                                    toggleRiskFactor(factor)
                                  }
                                />
                                <label
                                  htmlFor={factor}
                                  className="text-sm cursor-pointer leading-tight"
                                >
                                  {factor}
                                </label>
                              </div>
                            ))}
                          </div>

                          <div>
                            <Label
                              htmlFor="customRiskFactor"
                              className="text-xs"
                            >
                              Add Custom Risk Factor
                            </Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                id="customRiskFactor"
                                value={formData.customRiskFactor}
                                onChange={(e) =>
                                  updateFormData(
                                    "customRiskFactor",
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter custom risk factor"
                                className="text-sm"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCustomRiskFactor();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addCustomRiskFactor}
                              >
                                Add
                              </Button>
                            </div>
                          </div>

                          {formData.riskFactors.filter(
                            (f) => !presetRiskFactors.includes(f),
                          ).length > 0 && (
                            <div>
                              <Label className="text-xs mb-2 block">
                                Custom Risk Factors:
                              </Label>
                              <div className="space-y-2">
                                {formData.riskFactors
                                  .filter(
                                    (f) => !presetRiskFactors.includes(f),
                                  )
                                  .map((factor) => (
                                    <div
                                      key={factor}
                                      className="flex items-center justify-between p-2 bg-background rounded border text-sm"
                                    >
                                      <span>{factor}</span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRiskFactor(factor)}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {formData.type === "Off Plan" && (
                          <div>
                            <Label htmlFor="offPlanSecurity">
                              Off-plan Security Notes
                            </Label>
                            <Textarea
                              id="offPlanSecurity"
                              value={formData.offPlanSecurity}
                              onChange={(e) =>
                                updateFormData(
                                  "offPlanSecurity",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Developer escrow account + Bank guarantee"
                              rows={3}
                            />
                          </div>
                        )}

                        <div>
                          <Label htmlFor="exitLiquidity">
                            Exit Liquidity Settings *
                          </Label>
                          <Select
                            value={formData.exitLiquidity}
                            onValueChange={(val) =>
                              updateFormData("exitLiquidity", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="High">
                                High - Can exit within 30 days
                              </SelectItem>
                              <SelectItem value="Medium">
                                Medium - Exit within 60-90 days
                              </SelectItem>
                              <SelectItem value="Low">
                                Low - Exit after 6+ months
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="managementMode">
                            Management Mode *
                          </Label>
                          <Select
                            value={formData.managementMode}
                            onValueChange={(val) =>
                              updateFormData("managementMode", val)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={`${formData.platform}-managed`}>
                                {formData.platform}-managed
                              </SelectItem>
                              <SelectItem value="Self-managed">
                                Self-managed
                              </SelectItem>
                              <SelectItem value="Third-party managed">
                                Third-party managed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                          <CircleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-amber-900 dark:text-amber-100">
                            <strong>Transparency Notice:</strong> All risk
                            factors, construction progress, and financial
                            projections are regularly updated and verified by
                            independent auditors.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 7: Media & Documentation */}
                    {currentStep === 7 && (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
                          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h4 className="font-medium mb-1">Upload Images</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            High-quality photos of the property
                          </p>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            Choose Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formData.images > 0
                              ? `${formData.images} images uploaded`
                              : "No images uploaded yet"}
                          </p>
                          {uploadedImages.length > 0 && (
                            <div className="mt-4 space-y-2 text-left">
                              {uploadedImages.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                  <span className="truncate flex-1">
                                    {file.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
                          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h4 className="font-medium mb-1">Upload Documents</h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Legal documents, floor plans, certificates
                          </p>
                          <input
                            ref={documentInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            multiple
                            onChange={handleDocumentUpload}
                            className="hidden"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => documentInputRef.current?.click()}
                          >
                            Choose Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formData.documents > 0
                              ? `${formData.documents} documents uploaded`
                              : "No documents uploaded yet"}
                          </p>
                          {uploadedDocuments.length > 0 && (
                            <div className="mt-4 space-y-2 text-left">
                              {uploadedDocuments.map((file, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                >
                                  <span className="truncate flex-1">
                                    {file.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-muted-foreground transition-colors">
                          <Video className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <h4 className="font-medium mb-1">
                            Virtual Tour Links
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            Add 360° virtual tours or video walkthroughs
                          </p>
                          <Input
                            placeholder="https://..."
                            className="mt-2 max-w-md mx-auto"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            {formData.virtualTours > 0
                              ? `${formData.virtualTours} tours added`
                              : "No virtual tours added yet"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step 8: Commission Setup */}
                    {currentStep === 8 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h4 className="font-medium mb-1">
                            Commission Structure
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Set commission percentages for agents involved in
                            the sale
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="leadCommission">
                              Lead Commission (%) *
                            </Label>
                            <Input
                              id="leadCommission"
                              type="number"
                              step="0.1"
                              value={formData.leadCommission}
                              onChange={(e) =>
                                updateFormData("leadCommission", e.target.value)
                              }
                              placeholder="1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="closerCommission">
                              Deal Closer Commission (%) *
                            </Label>
                            <Input
                              id="closerCommission"
                              type="number"
                              step="0.1"
                              value={formData.closerCommission}
                              onChange={(e) =>
                                updateFormData(
                                  "closerCommission",
                                  e.target.value,
                                )
                              }
                              placeholder="1.5"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Total Commission
                              </div>
                              <div className="text-2xl font-semibold text-accent">
                                {totalCommission.toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Commission per Sale
                              </div>
                              <div className="text-2xl font-semibold text-accent">
                                ₦
                                {(
                                  (finalPrice * totalCommission) /
                                  100
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Based on final selling price of ₦
                            {finalPrice.toLocaleString()}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="text-sm">Lead Agent Earns:</span>
                            <span className="font-semibold">
                              ₦
                              {(
                                (finalPrice *
                                  (parseFloat(formData.leadCommission) || 0)) /
                                100
                              ).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded">
                            <span className="text-sm">Closer Agent Earns:</span>
                            <span className="font-semibold">
                              ₦
                              {(
                                (finalPrice *
                                  (parseFloat(formData.closerCommission) ||
                                    0)) /
                                100
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 9: Review & Publish - Should be same as create */}
                    {currentStep === 9 && (
                      <div className="space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <h3 className="font-semibold text-lg mb-4">
                            Asset Summary
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Asset Name:
                              </span>
                              <span className="font-medium text-right">
                                {formData.name || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Reference Code:
                              </span>
                              <span className="font-medium">
                                {formData.referenceCode || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Type:
                              </span>
                              <Badge variant="outline">
                                {formData.type?.toUpperCase() || "—"}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Development Stage:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  formData.developmentStage ===
                                  "Before Development"
                                    ? "border-amber-500 text-amber-600 bg-amber-50"
                                    : "border-emerald-500 text-emerald-600 bg-emerald-50"
                                }
                              >
                                {formData.developmentStage}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Investment Program:
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  isHarbor
                                    ? "border-purple-500 text-purple-600 bg-purple-50"
                                    : "border-blue-500 text-blue-600 bg-blue-50"
                                }
                              >
                                {formData.platform}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Location:
                              </span>
                              <span className="font-medium text-right">
                                {formData.location || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Property Category:
                              </span>
                              <span className="font-medium">
                                {formData.propertyCategory || "—"}
                              </span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">
                                Total Units:
                              </span>
                              <span className="font-medium">
                                {formData.totalUnits || "—"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                          <h4 className="font-medium text-accent mb-3">
                            Financial Summary
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Final Selling Price:
                              </span>
                              <span className="font-semibold">
                                ₦{finalPrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Ownership Type:</span>
                              <span className="font-medium">
                                {formData.ownershipType}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Total Annual Return:
                              </span>
                              <span className="font-semibold text-accent">
                                {totalAnnualReturn}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Total Commission:</span>
                              <span className="font-semibold">
                                {totalCommission.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">
                              Publish Status
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Toggle to publish asset immediately
                            </p>
                          </div>
                          <Switch
                            checked={formData.status === "published"}
                            onCheckedChange={(val) =>
                              updateFormData(
                                "status",
                                val ? "published" : "draft",
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="border-t pt-4 px-6">
                    <div className="flex justify-between w-full">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedPlatform("");
                            setFormData(INITIAL_FORM_DATA);
                            setCurrentStep(1);
                          }}
                        >
                          ← Change Platform
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCreateDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSubmit("draft")}
                          disabled={loading}
                        >
                          Save & Continue Later
                        </Button>
                        {currentStep < totalSteps ? (
                          <Button onClick={nextStep}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        ) : (
                          <Button onClick={() => handleSubmit()}>
                            {formData.status === "published"
                              ? "Publish Asset"
                              : "Save as Draft"}
                          </Button>
                        )}
                      </div>
                    </div>
                   </DialogFooter>
                </DialogContent>
              </Dialog>
    </div>
  );
}
