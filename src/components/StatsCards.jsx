import React from "react";
import { Users, DollarSign, TrendingUp, Award } from "lucide-react";

export default function StatsCards({ data }) {
    const metrics = [
        {
            title: "รวมงบประมาณทั้งหมด",
            value: `${(data.reduce((sum, d) => sum + (d.Budget || 0), 0) / 1_000_000).toFixed(2)} M บาท`,
            icon: DollarSign,
            color: "bg-green-100 text-green-600",
        },
        {
            title: "ทุนเฉลี่ย",
            value: `${(data.reduce((sum, d) => sum + (d.Budget || 0), 0) / data.length || 0).toFixed(0)} บาท`,
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "ทุนสูงสุด",
            value: `${Math.max(...data.map((d) => d.Budget || 0)).toLocaleString()} บาท`,
            icon: TrendingUp,
            color: "bg-purple-100 text-purple-600",
        },
        {
            title: "ทุนต่ำสุด",
            value: `${Math.min(...data.map((d) => d.Budget || 0)).toLocaleString()} บาท`,
            icon: Award,
            color: "bg-yellow-100 text-yellow-600",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {metrics.map((m, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
                    <div className={`inline-flex p-3 rounded-full ${m.color}`}>
                        <m.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-gray-600">{m.title}</h3>
                    <p className="text-2xl font-bold">{m.value}</p>
                </div>
            ))}
        </div>
    );
}
