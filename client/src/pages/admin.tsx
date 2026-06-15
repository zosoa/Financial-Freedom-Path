import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

interface AdminStats {
  totalSubmissions: number;
  totalLeads: number;
  conversionRate: number;
  byCountry: Array<{ country: string; count: number }>;
  byCurrency: Array<{ currency: string; count: number }>;
  averageFreedomScore: number;
  averageGapPercent: number;
  submissionsByDay: Array<{ date: string; count: number }>;
  topCountries: Array<{ country: string; count: number; avgScore: number }>;
  leadsByStatus: Array<{ status: string; count: number }>;
  recentSubmissions: Array<{
    id: string;
    country: string;
    age: number;
    gapPercent: number;
    freedomScore: number;
    createdAt: Date;
  }>;
}

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [adminKey, setAdminKey] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Try to load from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("admin_key");
    if (savedKey) {
      setAdminKey(savedKey);
      setIsAuthenticated(true);
      fetchStats(savedKey);
    }
  }, []);

  const fetchStats = async (key: string) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/stats?key=${encodeURIComponent(key)}`);
      if (!response.ok) {
        throw new Error("Unauthorized or failed to fetch stats");
      }
      const data = await response.json();
      setStats(data);
      localStorage.setItem("admin_key", key);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
      setIsAuthenticated(false);
      localStorage.removeItem("admin_key");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) {
      setError("Please enter an admin key");
      return;
    }
    fetchStats(adminKey);
  };

  const handleLogout = () => {
    setAdminKey("");
    setIsAuthenticated(false);
    setStats(null);
    localStorage.removeItem("admin_key");
  };

  // Chart colors matching FinkSmart theme
  const chartColors = [
    "hsl(38 92% 50%)",    // amber
    "hsl(160 84% 39%)",   // mint
    "hsl(199 89% 48%)",   // sky
    "hsl(24 95% 62%)",    // coral
    "hsl(262 83% 58%)",   // violet
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-background to-background">
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-center mb-2">Admin Dashboard</h1>
            <p className="text-center text-muted-foreground mb-8">Enter your admin key to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="key" className="block text-sm font-medium mb-2">
                  Admin Key
                </label>
                <input
                  id="key"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="w-full px-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {isLoading ? "Loading..." : "Access Dashboard"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-background to-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Process data for trends chart
  const trendsData = stats.submissionsByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    submissions: item.count,
  }));

  // Process top countries for chart
  const topCountriesChart = stats.topCountries
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Currency chart data
  const currencyChart = stats.byCurrency
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((item) => ({
      currency: item.currency,
      count: item.count,
    }));

  // Lead status data
  const leadStatusData = stats.leadsByStatus.map((item) => ({
    name: item.status.replace(/_/g, " ").charAt(0).toUpperCase() + item.status.replace(/_/g, " ").slice(1),
    value: item.count,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-background to-background">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-bold">Simulator Analytics</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            label="Total Submissions"
            value={stats.totalSubmissions.toLocaleString()}
            subtext={`Last 30 days: ${stats.submissionsByDay.reduce((sum, d) => sum + d.count, 0)}`}
            color="bg-yellow-50 border-yellow-200"
            textColor="text-yellow-700"
          />
          <MetricCard
            label="Total Leads"
            value={stats.totalLeads.toLocaleString()}
            subtext={`${stats.conversionRate.toFixed(1)}% conversion rate`}
            color="bg-green-50 border-green-200"
            textColor="text-green-700"
          />
          <MetricCard
            label="Avg Freedom Score"
            value={stats.averageFreedomScore.toFixed(1)}
            subtext="out of 100"
            color="bg-blue-50 border-blue-200"
            textColor="text-blue-700"
          />
          <MetricCard
            label="Avg Gap %"
            value={stats.averageGapPercent.toFixed(1)}
            subtext="percent gap"
            color="bg-orange-50 border-orange-200"
            textColor="text-orange-700"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Submissions Trend */}
          <div className="bg-white rounded-xl border border-card-border p-6">
            <h2 className="text-lg font-semibold mb-4">Submissions Trend (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="hsl(38 92% 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(38 92% 50%)", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Countries */}
          <div className="bg-white rounded-xl border border-card-border p-6">
            <h2 className="text-lg font-semibold mb-4">Top Countries</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCountriesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="country" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(160 84% 39%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Currencies */}
          <div className="bg-white rounded-xl border border-card-border p-6">
            <h2 className="text-lg font-semibold mb-4">Top Currencies</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={currencyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="currency" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(199 89% 48%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Status */}
          <div className="bg-white rounded-xl border border-card-border p-6">
            <h2 className="text-lg font-semibold mb-4">Leads by Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-xl border border-card-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Submissions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Country</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Age</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Gap %</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Freedom Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSubmissions.map((submission, idx) => (
                  <tr key={submission.id} className={idx % 2 === 0 ? "bg-background" : "bg-white"}>
                    <td className="py-3 px-4">{submission.country}</td>
                    <td className="py-3 px-4">{submission.age}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={submission.gapPercent > 50 ? "text-red-600 font-semibold" : "text-green-600"}>
                        {submission.gapPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded font-semibold">
                        {submission.freedomScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  textColor: string;
}

function MetricCard({ label, value, subtext, color, textColor }: MetricCardProps) {
  return (
    <div className={`rounded-xl border ${color} p-6`}>
      <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
      <p className={`text-3xl font-bold ${textColor} mb-1`}>{value}</p>
      <p className="text-xs text-muted-foreground">{subtext}</p>
    </div>
  );
}
