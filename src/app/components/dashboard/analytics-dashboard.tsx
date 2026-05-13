import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Building2,
  TrendingUp,
  Receipt,
  ArrowUp,
  ArrowDown,
  Users,
  Layers,
  DollarSign,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { dashboardApi, transactionsApi } from "../../../utils/api-service";
import { NairaSign } from "../NairaSign";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { formatDate } from "../../../utils/format";

const iconMap = {
  dollarSign: DollarSign,
  receipt: Receipt,
  building: Building2,
  trendingUp: TrendingUp,
};

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export function AnalyticsDashboard() {
  const [kpiData, setKpiData] = useState<any>(null);
  const [assetDistributionData, setAssetDistributionData] = useState<any[]>([]);
  const [salesVolumeData, setSalesVolumeData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const overview = await dashboardApi.getOverview();
        const transactions = await dashboardApi.getRecentTransactions();
        const charts = await dashboardApi.getCharts();
        setKpiData(overview);
        setAssetDistributionData(charts.assetDistribution || []);
        setSalesVolumeData(charts.revenueByMonth || []);
        setRecentTransactions(transactions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const filteredTransactions = platformFilter === "all"
    ? recentTransactions
    : recentTransactions.filter((t) => t.assetPlatform === platformFilter);

  const kpis = kpiData ? [
    {
      title: "Total Revenue",
      value: `₦${(kpiData.totalRevenue || 0).toLocaleString()}`,
      icon: "dollarSign",
      change: kpiData.revenueGrowth,
      changeType: "increase" as const,
    },
    {
      title: "Total Transactions",
      value: kpiData.totalTransactions || 0,
      icon: "receipt",
      change: kpiData.transactionGrowth,
      changeType: "increase" as const,
    },
    {
      title: "Active Assets",
      value: kpiData.activeAssets || 0,
      icon: "building",
      change: 0,
      changeType: "neutral" as const,
    },
    {
      title: "Total Leads",
      value: kpiData.totalLeads || 0,
      icon: "trendingUp",
      change: kpiData.leadConversionRate,
      changeType: "increase" as const,
      changeLabel: "Conversion",
    },
  ] : [];

  const platformKpis = kpiData ? [
    {
      platform: "BuyOps",
      revenue: kpiData.buyOpsRevenue || 0,
      transactions: kpiData.buyOpsTransactions || 0,
      assets: kpiData.buyOpsAssets || 0,
      investors: kpiData.buyOpsInvestors || 0,
    },
    {
      platform: "URBCO",
      revenue: kpiData.urbcoRevenue || 0,
      transactions: kpiData.urbcoTransactions || 0,
      assets: kpiData.urbcoAssets || 0,
      investors: kpiData.urbcoInvestors || 0,
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = iconMap[kpi.icon as keyof typeof iconMap] || Building2;
          return (
            <Card key={index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  {kpi.changeType === "increase" && (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  )}
                  {kpi.changeType === "decrease" && (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <p
                    className={`text-xs ${
                      kpi.changeType === "increase"
                        ? "text-green-500"
                        : kpi.changeType === "decrease"
                          ? "text-red-500"
                          : "text-muted-foreground"
                    }`}
                  >
                    {kpi.changeLabel || "Growth"}: {kpi.change}%
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Platform Comparison */}
      <div className="grid gap-6 md:grid-cols-2">
        {platformKpis.map((pk) => (
          <Card key={pk.platform} className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    pk.platform === "URBCO"
                      ? "border-purple-500 text-purple-700"
                      : "border-blue-500 text-blue-700"
                  }
                >
                  {pk.platform}
                </Badge>
                <span className="text-sm text-muted-foreground">Platform Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="text-lg font-semibold">₦{pk.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">{pk.transactions}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assets</p>
                  <p className="text-lg font-semibold">{pk.assets}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Investors</p>
                  <p className="text-lg font-semibold">{pk.investors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetDistributionData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {assetDistributionData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <Label className="text-sm">Platform:</Label>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="BuyOps">BuyOps</SelectItem>
                <SelectItem value="URBCO">URBCO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          txn.assetPlatform === "URBCO"
                            ? "border-purple-500 text-purple-700"
                            : "border-blue-500 text-blue-700"
                        }
                      >
                        {txn.assetPlatform || "BuyOps"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{txn.serialId}</TableCell>
                    <TableCell>{txn.assetName}</TableCell>
                    <TableCell>{txn.buyerName}</TableCell>
                    <TableCell className="font-medium">
                      ₦{txn.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={txn.status === "completed" ? "default" : "secondary"}
                      >
                        {txn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(txn.date)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
