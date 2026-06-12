"use client";

// ============================================================
// ANALYTICS CHARTS
//
// LEARNING: Recharts uses browser APIs, so this must be a
// Client Component. The parent Server Component fetches the
// data and passes it as props.
// ============================================================

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/index";
import type { AnalyticsOverview } from "@/types";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/lib/utils";
import type { TaskStatus, TaskPriority } from "@/types";

interface AnalyticsChartsProps {
  data: AnalyticsOverview;
}

export function ActivityChart({ data }: AnalyticsChartsProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-900">Task Activity</h3>
        <p className="text-xs text-slate-500">Tasks created vs. completed over time</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data.period_data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area
              type="monotone"
              dataKey="tasks_created"
              name="Created"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#created)"
            />
            <Area
              type="monotone"
              dataKey="tasks_completed"
              name="Completed"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#completed)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TasksByStatusChart({ data }: AnalyticsChartsProps) {
  const chartData = (Object.entries(data.tasks_by_status) as [TaskStatus, number][]).map(
    ([status, count]) => ({
      name: TASK_STATUS_CONFIG[status].label,
      value: count,
      color: getStatusColor(status),
    })
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-900">Tasks by Status</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-600 truncate">{item.name}</span>
              <span className="text-xs text-slate-400 ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function TasksByPriorityChart({ data }: AnalyticsChartsProps) {
  const chartData = (Object.entries(data.tasks_by_priority) as [TaskPriority, number][]).map(
    ([priority, count]) => ({
      name: TASK_PRIORITY_CONFIG[priority].label,
      count,
    })
  );

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-slate-900">Tasks by Priority</h3>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" name="Tasks" radius={[4, 4, 0, 0]} fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: TaskStatus): string {
  const map: Record<TaskStatus, string> = {
    backlog: "#94a3b8",
    todo: "#3b82f6",
    in_progress: "#f59e0b",
    in_review: "#8b5cf6",
    done: "#10b981",
    cancelled: "#cbd5e1",
  };
  return map[status];
}
