import React from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area, CartesianGrid
} from "recharts";
import { BarChart3 } from "lucide-react";

export default function Charts({ data, selectedMetric }) {
    const colors = ["#6366F1", "#22C55E", "#F59E0B", "#EF4444"];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <div className="p-6 bg-white rounded-2xl shadow">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-indigo-500" />
                    <h2 className="font-semibold">งบประมาณตามสถาบัน</h2>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <XAxis dataKey="Institution" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="Budget" fill="#6366F1" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="p-6 bg-white rounded-2xl shadow">
                <h2 className="font-semibold mb-4">สัดส่วนงบประมาณ</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={data} dataKey="Budget" nameKey="Institution" outerRadius={100}>
                            {data.map((_, i) => (
                                <Cell key={i} fill={colors[i % colors.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="p-6 bg-white rounded-2xl shadow">
                <h2 className="font-semibold mb-4">แนวโน้ม {selectedMetric}</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="Institution" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Area type="monotone" dataKey={selectedMetric} stroke="#6366F1" fillOpacity={1} fill="url(#colorBudget)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
