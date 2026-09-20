import {
  Building2,
  Calendar,
  CheckCircle2,
  CircleAlert,
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

  const updateFormData = (key: keyof typeof INITIAL_FORM_DATA, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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

  // Step Navigation & Validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter the Asset Name");
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
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
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
        downPaymentAmount: asset.downPaymentAmount?.toString() || "",
        offPlanDiscount: asset.offPlanDiscount?.toString() || "",
        projectedRentalIncome: asset.projectedRentalIncome?.toString() || "",
        rentalYieldMin: asset.rentalYieldMin?.toString() || "",
        rentalYieldMax: asset.rentalYieldMax?.toString() || "",
        capitalAppreciationMin: asset.capitalAppreciationMin?.toString() || "",
        capitalAppreciationMax: asset.capitalAppreciationMax?.toString() || "",
        totalReturnsMin: asset.totalReturnsMin?.toString() || "",
        totalReturnsMax: asset.totalReturnsMax?.toString() || "",
        constructionProgress: asset.constructionStage?.toString() || "",
        riskLevel: asset.riskLevel || "Low",
        riskFactors: asset.riskFactors || [],
        managementMode: asset.managementMode || "Urbco Foundry-managed",
        leadCommission: asset.leadCommission?.toString() || "2.5",
        closerCommission: asset.closerCommission?.toString() || "1.5",
        status: asset.status || "active",
      });
      setEditDialogOpen(true);
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
                          Step {currentStep} of 4:{" "}
                          {currentStep === 1
                            ? "Level 1 Basic Information & Stage"
                            : currentStep === 2
                              ? "Financial Configuration & Application"
                              : currentStep === 3
                                ? "Investment Returns & Risk Assessment"
                                : "Media, Documentation & Review"}
                        </DialogDescription>
                      </div>
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
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-secondary h-2 rounded-full mt-4 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-300"
                        style={{ width: `${(currentStep / 4) * 100}%` }}
                      />
                    </div>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
                        {error}
                      </div>
                    )}

                    {/* STEP 1: LEVEL 1 BASIC INFORMATION & DEVELOPMENT STAGE */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        {/* Development Stage Card Selection */}
                        <div>
                          <Label className="text-base font-semibold mb-2 block">
                            1. Select Development Stage *
                          </Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Determines investment structure, cost details, ROI metrics, and investor targeting.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              onClick={() => updateFormData("developmentStage", "Before Development")}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                formData.developmentStage === "Before Development"
                                  ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20"
                                  : "border-border hover:border-amber-300"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
                                  <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">Before Development</h4>
                                  <span className="text-xs text-amber-600 font-medium">Pre-construction / Off-plan</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                For planning, land acquisition, foundation, and early construction investments. Tracks pre-funding targets and projected ROI.
                              </p>
                            </div>

                            <div
                              onClick={() => updateFormData("developmentStage", "After Development")}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                formData.developmentStage === "After Development"
                                  ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                                  : "border-border hover:border-emerald-300"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold">
                                  <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">After Development</h4>
                                  <span className="text-xs text-emerald-600 font-medium">Completed / Ready Asset</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                For finished properties and active revenue-generating assets. Tracks current valuation, actual rental yields, and cashflow.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Basic Details */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold block border-b pb-2">
                            2. Identity & Developer Info
                          </Label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="asset-name">Asset Title / Name *</Label>
                              <Input
                                id="asset-name"
                                value={formData.name}
                                onChange={(e) => updateFormData("name", e.target.value)}
                                placeholder="e.g. Marina Heights Tower A"
                              />
                            </div>
                            <div>
                              <Label htmlFor="asset-ref">Reference Code / Slug</Label>
                              <Input
                                id="asset-ref"
                                value={formData.referenceCode}
                                onChange={(e) => updateFormData("referenceCode", e.target.value)}
                                placeholder="e.g. MHT-A-2026"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Property Category *</Label>
                              <Select
                                value={formData.propertyCategory}
                                onValueChange={(val) => updateFormData("propertyCategory", val)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Residential">Residential</SelectItem>
                                  <SelectItem value="Commercial">Commercial</SelectItem>
                                  <SelectItem value="Industrial">Industrial</SelectItem>
                                  <SelectItem value="Mixed-use">Mixed-use</SelectItem>
                                  <SelectItem value="Land">Land</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Asset Type *</Label>
                              <Select
                                value={formData.type}
                                onValueChange={(val) => updateFormData("type", val)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Off Plan">Off Plan</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                                  <SelectItem value="Land">Land</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Developer / Company *</Label>
                              <Select
                                value={formData.company}
                                onValueChange={(val) => updateFormData("company", val)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select partner developer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {companies.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="asset-location">Location / Neighborhood *</Label>
                              <Input
                                id="asset-location"
                                value={formData.location}
                                onChange={(e) => updateFormData("location", e.target.value)}
                                placeholder="e.g. Victoria Island, Lagos"
                              />
                            </div>
                            <div>
                              <Label htmlFor="asset-address">Full Address</Label>
                              <Input
                                id="asset-address"
                                value={formData.address}
                                onChange={(e) => updateFormData("address", e.target.value)}
                                placeholder="e.g. Plot 1234, Marina Road"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Physical Specs */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold block border-b pb-2">
                            3. Physical & Specifications
                          </Label>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label>Land Size (sqm)</Label>
                              <Input
                                value={formData.landSize}
                                onChange={(e) => updateFormData("landSize", e.target.value)}
                                placeholder="e.g. 5000"
                              />
                            </div>
                            <div>
                              <Label>Built Size (sqm)</Label>
                              <Input
                                value={formData.builtSize}
                                onChange={(e) => updateFormData("builtSize", e.target.value)}
                                placeholder="e.g. 45000"
                              />
                            </div>
                            <div>
                              <Label>Total Units</Label>
                              <Input
                                type="number"
                                value={formData.totalUnits}
                                onChange={(e) => updateFormData("totalUnits", e.target.value)}
                                placeholder="156"
                              />
                            </div>
                            <div>
                              <Label>Available Units</Label>
                              <Input
                                type="number"
                                value={formData.availableUnits}
                                onChange={(e) => updateFormData("availableUnits", e.target.value)}
                                placeholder="142"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="asset-desc">Property Overview / Description</Label>
                            <Textarea
                              id="asset-desc"
                              rows={3}
                              value={formData.description}
                              onChange={(e) => updateFormData("description", e.target.value)}
                              placeholder="Describe the property, architectural highlights, and strategic location advantages..."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: FINANCIAL CONFIGURATION & APPLICATION SORTING */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        {/* Application Sorting Selection */}
                        <div>
                          <Label className="text-base font-semibold mb-2 block">
                            1. Select Application Sorting *
                          </Label>
                          <p className="text-xs text-muted-foreground mb-3">
                            Specify whether this asset belongs to Urbco Foundry or Urbco Harbor for user access & level routing.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              onClick={() => updateFormData("platform", "Urbco Foundry")}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                formData.platform === "Urbco Foundry"
                                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                                  : "border-border hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                  OF
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">Urbco Foundry</h4>
                                  <span className="text-xs text-blue-600 font-medium">Foundry Application</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                High-velocity property sales, core commercial assets, and primary investment portfolios.
                              </p>
                            </div>

                            <div
                              onClick={() => updateFormData("platform", "Urbco Harbor")}
                              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                formData.platform === "Urbco Harbor"
                                  ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20"
                                  : "border-border hover:border-purple-300"
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                                  OH
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">Urbco Harbor</h4>
                                  <span className="text-xs text-purple-600 font-medium">Harbor Application</span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Specialized institutional funding, development projects, and capital partner offerings.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Financial Inputs Adapted to Stage */}
                        <div className="space-y-4 border-t pt-4">
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold">
                              2. Financial Structure ({formData.developmentStage})
                            </Label>
                            <Badge variant="secondary">{formData.platform}</Badge>
                          </div>

                          {formData.developmentStage === "Before Development" ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Land / Pre-development Cost (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={(e) => updateFormData("basePrice", e.target.value)}
                                    placeholder="e.g. 500000000"
                                  />
                                </div>
                                <div>
                                  <Label>Estimated Construction Cost (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.estimatedDevCost}
                                    onChange={(e) => updateFormData("estimatedDevCost", e.target.value)}
                                    placeholder="e.g. 2500000000"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Urbco Markup (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.markup}
                                    onChange={(e) => updateFormData("markup", e.target.value)}
                                    placeholder="e.g. 75000000"
                                  />
                                </div>
                                <div>
                                  <Label>Off-Plan / Pre-Launch Discount (%)</Label>
                                  <Input
                                    type="number"
                                    value={formData.offPlanDiscount}
                                    onChange={(e) => updateFormData("offPlanDiscount", e.target.value)}
                                    placeholder="e.g. 10"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Base Property Valuation (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={(e) => updateFormData("basePrice", e.target.value)}
                                    placeholder="e.g. 8500000000"
                                  />
                                </div>
                                <div>
                                  <Label>Urbco Markup (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.markup}
                                    onChange={(e) => updateFormData("markup", e.target.value)}
                                    placeholder="e.g. 1275000000"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Annual Operating Cost (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.operatingCost}
                                    onChange={(e) => updateFormData("operatingCost", e.target.value)}
                                    placeholder="e.g. 150000000"
                                  />
                                </div>
                                <div>
                                  <Label>Required Down Payment (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.downPaymentAmount}
                                    onChange={(e) => updateFormData("downPaymentAmount", e.target.value)}
                                    placeholder="e.g. 1500000000"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Calculated Pricing Card */}
                          <div className="p-4 bg-muted/50 rounded-xl border flex items-center justify-between">
                            <div>
                              <span className="text-xs text-muted-foreground uppercase font-semibold">
                                Total Final Price / Investment Value
                              </span>
                              <div className="text-2xl font-bold flex items-center gap-1 text-primary">
                                <NairaSign />
                                {computedFinal.toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground">
                              <div>Base: ₦{computedBase.toLocaleString()}</div>
                              <div>Markup: ₦{computedMarkup.toLocaleString()}</div>
                            </div>
                          </div>

                          {/* Ownership Type */}
                          <div className="space-y-2">
                            <Label>Ownership Structure</Label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  name="ownershipType"
                                  checked={formData.ownershipType === "Full"}
                                  onChange={() => updateFormData("ownershipType", "Full")}
                                />
                                Full Title Ownership
                              </label>
                              <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  name="ownershipType"
                                  checked={formData.ownershipType === "Fractional"}
                                  onChange={() => updateFormData("ownershipType", "Fractional")}
                                />
                                Fractional / Co-investment
                              </label>
                            </div>

                            {formData.ownershipType === "Fractional" && (
                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                  <Label>Total Fractions</Label>
                                  <Input
                                    type="number"
                                    value={formData.fractionTotal}
                                    onChange={(e) => updateFormData("fractionTotal", e.target.value)}
                                    placeholder="1000"
                                  />
                                </div>
                                <div>
                                  <Label>Cost Per Fraction (₦)</Label>
                                  <Input
                                    type="number"
                                    value={formData.costPerFraction}
                                    onChange={(e) => updateFormData("costPerFraction", e.target.value)}
                                    placeholder="5000000"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: INVESTMENT RETURNS & RISK ASSESSMENT */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                          <Label className="text-base font-semibold">
                            Investment Returns & Risk ({formData.developmentStage})
                          </Label>
                          <Badge
                            className={
                              formData.developmentStage === "Before Development"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }
                          >
                            {formData.developmentStage}
                          </Badge>
                        </div>

                        {formData.developmentStage === "Before Development" ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Target Pre-funding Goal (₦)</Label>
                                <Input
                                  type="number"
                                  value={formData.targetFunding}
                                  onChange={(e) => updateFormData("targetFunding", e.target.value)}
                                  placeholder="e.g. 5000000000"
                                />
                              </div>
                              <div>
                                <Label>Minimum Investment Amount (₦)</Label>
                                <Input
                                  type="number"
                                  value={formData.minimumInvestment}
                                  onChange={(e) => updateFormData("minimumInvestment", e.target.value)}
                                  placeholder="e.g. 5000000"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Projected Rental Yield (%)</Label>
                                <Input
                                  value={formData.rentalYieldMax}
                                  onChange={(e) => updateFormData("rentalYieldMax", e.target.value)}
                                  placeholder="e.g. 9.5"
                                />
                              </div>
                              <div>
                                <Label>Projected Appreciation (%)</Label>
                                <Input
                                  value={formData.capitalAppreciationMax}
                                  onChange={(e) => updateFormData("capitalAppreciationMax", e.target.value)}
                                  placeholder="e.g. 18.0"
                                />
                              </div>
                              <div>
                                <Label>Projected Total ROI (%)</Label>
                                <Input
                                  value={formData.totalReturnsMax}
                                  onChange={(e) => updateFormData("totalReturnsMax", e.target.value)}
                                  placeholder="e.g. 27.5"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Construction Progress (%)</Label>
                                <Input
                                  type="number"
                                  value={formData.constructionProgress}
                                  onChange={(e) => updateFormData("constructionProgress", e.target.value)}
                                  placeholder="25"
                                />
                              </div>
                              <div>
                                <Label>Expected First Dividend / Return Date</Label>
                                <Input
                                  type="date"
                                  value={formData.firstPayoutDate}
                                  onChange={(e) => updateFormData("firstPayoutDate", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Projected Annual Rental Income (₦)</Label>
                                <Input
                                  type="number"
                                  value={formData.projectedRentalIncome}
                                  onChange={(e) => updateFormData("projectedRentalIncome", e.target.value)}
                                  placeholder="e.g. 680000000"
                                />
                              </div>
                              <div>
                                <Label>Rental Payout Frequency</Label>
                                <Select
                                  value={formData.rentalFrequency}
                                  onValueChange={(val) => updateFormData("rentalFrequency", val)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Monthly">Monthly</SelectItem>
                                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                                    <SelectItem value="Annual">Annual</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label>Actual Rental Yield (%)</Label>
                                <Input
                                  value={formData.rentalYieldMax}
                                  onChange={(e) => updateFormData("rentalYieldMax", e.target.value)}
                                  placeholder="e.g. 8.5"
                                />
                              </div>
                              <div>
                                <Label>Annual Capital Appreciation (%)</Label>
                                <Input
                                  value={formData.capitalAppreciation}
                                  onChange={(e) => updateFormData("capitalAppreciation", e.target.value)}
                                  placeholder="e.g. 12.0"
                                />
                              </div>
                              <div>
                                <Label>Net Cashflow Returns (%)</Label>
                                <Input
                                  value={formData.totalReturnsMax}
                                  onChange={(e) => updateFormData("totalReturnsMax", e.target.value)}
                                  placeholder="e.g. 20.5"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Risk Factors */}
                        <div className="space-y-3 border-t pt-4">
                          <Label className="text-sm font-semibold">Risk Classification</Label>
                          <div className="grid grid-cols-3 gap-4">
                            {["Low", "Medium", "High"].map((level) => (
                              <button
                                key={level}
                                type="button"
                                onClick={() => updateFormData("riskLevel", level)}
                                className={`p-3 text-center border rounded-lg text-sm font-medium transition-all ${
                                  formData.riskLevel === level
                                    ? level === "Low"
                                      ? "bg-emerald-500 text-white border-emerald-600"
                                      : level === "Medium"
                                        ? "bg-amber-500 text-white border-amber-600"
                                        : "bg-red-500 text-white border-red-600"
                                    : "bg-background border-border text-foreground hover:bg-muted"
                                }`}
                              >
                                {level} Risk
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: MEDIA, DOCUMENTS & REVIEW */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        {/* Media Upload */}
                        <div className="space-y-4">
                          <Label className="text-base font-semibold block border-b pb-2">
                            1. Media & Documentation
                          </Label>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                              onClick={() => imageInputRef.current?.click()}
                              className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all text-center"
                            >
                              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-sm font-medium">Upload Asset Images</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {uploadedImages.length} file(s) selected
                              </span>
                              <input
                                ref={imageInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                              />
                            </div>

                            <div
                              onClick={() => documentInputRef.current?.click()}
                              className="p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all text-center"
                            >
                              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                              <span className="text-sm font-medium">Upload Project Documents</span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {uploadedDocuments.length} document(s) selected
                              </span>
                              <input
                                ref={documentInputRef}
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx"
                                className="hidden"
                                onChange={handleDocumentUpload}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Commissions */}
                        <div className="space-y-4 border-t pt-4">
                          <Label className="text-base font-semibold block border-b pb-2">
                            2. Agent Commission Splits
                          </Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Lead Agent Commission (%)</Label>
                              <Input
                                value={formData.leadCommission}
                                onChange={(e) => updateFormData("leadCommission", e.target.value)}
                                placeholder="2.5"
                              />
                            </div>
                            <div>
                              <Label>Closer Agent Commission (%)</Label>
                              <Input
                                value={formData.closerCommission}
                                onChange={(e) => updateFormData("closerCommission", e.target.value)}
                                placeholder="1.5"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Review Card */}
                        <div className="p-4 bg-muted/40 rounded-xl border space-y-3">
                          <h4 className="font-semibold text-sm">Asset Review Summary</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Title:</span>
                              <div className="font-semibold">{formData.name || "—"}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stage:</span>
                              <div className="font-semibold text-amber-600">{formData.developmentStage}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Application:</span>
                              <div className="font-semibold text-blue-600">{formData.platform}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Price:</span>
                              <div className="font-semibold">₦{computedFinal.toLocaleString()}</div>
                            </div>
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

      {/* Edit Asset Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>Update details for {formData.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Development Stage</Label>
                <Select
                  value={formData.developmentStage}
                  onValueChange={(val) => updateFormData("developmentStage", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Before Development">Before Development</SelectItem>
                    <SelectItem value="After Development">After Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Application</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(val) => updateFormData("platform", val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Urbco Foundry">Urbco Foundry</SelectItem>
                    <SelectItem value="Urbco Harbor">Urbco Harbor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Asset Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-base-price">Base Price / Valuation (₦)</Label>
                <Input
                  id="edit-base-price"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => updateFormData("basePrice", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-markup">Markup (₦)</Label>
                <Input
                  id="edit-markup"
                  type="number"
                  value={formData.markup}
                  onChange={(e) => updateFormData("markup", e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
