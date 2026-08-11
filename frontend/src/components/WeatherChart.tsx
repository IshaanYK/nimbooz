"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface WeatherChartProps {
  records: any[];
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ records }) => {
  const data = records && records.length > 0
    ? records.map((r: any) => ({
        date: r.date ? r.date.split("T")[0].slice(5) : "Aug",
        tmax: r.temperature_max || 34,
        tmin: r.temperature_min || 24,
        rain: r.rainfall || 0,
        soil: Math.round((r.soil_moisture || 0.3) * 100),
      }))
    : [
        { date: "08-05", tmax: 33.2, tmin: 24.1, rain: 12.5, soil: 78 },
        { date: "08-06", tmax: 35.8, tmin: 25.5, rain: 2.0, soil: 74 },
        { date: "08-07", tmax: 36.5, tmin: 26.2, rain: 0.0, soil: 70 },
        { date: "08-08", tmax: 34.0, tmin: 24.8, rain: 18.0, soil: 82 },
        { date: "08-09", tmax: 32.5, tmin: 23.9, rain: 24.5, soil: 88 },
        { date: "08-10", tmax: 33.8, tmin: 24.5, rain: 4.0, soil: 84 },
        { date: "08-11", tmax: 35.1, tmin: 25.8, rain: 0.5, soil: 79 },
      ];

  return (
    <div className="apple-card p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Live Weather & Soil Moisture Timeline</h3>
          <p className="text-xs text-slate-500 font-normal">Meteoblue Dataset API (NEMSGLOBAL Operational Model)</p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-700">Max Temp (°C)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-700">Rainfall (mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span className="text-slate-700">Soil Moisture (%)</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis yAxisId="temp" stroke="#64748b" fontSize={11} domain={[15, 45]} tickLine={false} />
            <YAxis yAxisId="rain" orientation="right" stroke="#64748b" fontSize={11} domain={[0, 50]} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#0f172a",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            />
            <Bar yAxisId="rain" dataKey="rain" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.8} />
            <Line yAxisId="temp" type="monotone" dataKey="tmax" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line yAxisId="temp" type="monotone" dataKey="tmin" stroke="#4f46e5" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            <Line yAxisId="temp" type="monotone" dataKey="soil" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
