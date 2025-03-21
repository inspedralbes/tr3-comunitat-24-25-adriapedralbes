import { Calendar, Download, Search } from "lucide-react";

import { Card } from "./ui/card";

export function DashboardPreview() {
  return (
    <div className="relative mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 shadow-2xl backdrop-blur">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-gray-700" />
          <span className="text-sm text-gray-400">Monsters Inc.</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 rounded-md border border-gray-800 bg-gray-900 py-1.5 pl-10 pr-4 text-sm text-gray-400 placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-md border border-gray-800 px-3 py-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                Jan 20, 2023 - Feb 09, 2023
              </span>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-gray-900">
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value="$45,231.89"
            change="+20.1%"
            trend="up"
            subtitle="from last month"
          />
          <StatCard
            title="Subscriptions"
            value="+2350"
            change="+180.1%"
            trend="up"
            subtitle="from last month"
          />
          <StatCard
            title="Sales"
            value="+12,234"
            change="+19.4%"
            trend="up"
            subtitle="from last month"
          />
          <StatCard
            title="Active Now"
            value="+573"
            change="+201"
            trend="up"
            subtitle="since last hour"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  change,
  trend,
  subtitle,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  subtitle: string;
}) {
  return (
    <Card className="border-gray-800 bg-gray-900/50 p-4">
      <div className="mb-2 text-sm text-gray-400">{title}</div>
      <div className="mb-1 text-2xl font-semibold">{value}</div>
      <div className="flex items-center gap-1 text-sm">
        <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
          {change}
        </span>
        <span className="text-gray-500">{subtitle}</span>
      </div>
    </Card>
  );
}
