"use client";
import { FC } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Cell,
} from "recharts";
import { DataPerSila } from "./types";   // ✅ pakai types.ts

interface GrafikPerSilaProps {
  data: DataPerSila[];
  tahun: number;
}

const colors = ["#c0160aff", "#eb7725ff", "#ffcf11ff", "#0a8d20ff", "#167dd2ff"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow text-blue-900">
        <p className="font-semibold">{`${payload[0].payload.Sila}`}</p>
        <p>{`Nilai: ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const GrafikPerSila: FC<GrafikPerSilaProps> = ({ data, tahun }) => {
  return (
    <div className="p-4 rounded-xl backdrop-blur-sm shadow-lg border border-blue-200"
    style={{ backgroundImage: "url('/bg/bg7.jpg')" }}>
      <h3 className="font-semibold text-center text-blue-900 mb-2">
        Indeks Sila Penyusun IAP Tahun {tahun}
      </h3>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} barCategoryGap="5%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="Sila" tick={{ fill: "black", fontSize: 10 }} interval={0} />
          <YAxis tick={{ fill: "black", fontSize: 10 }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Nilai" animationDuration={800} radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                className="transition-transform duration-300 ease-out hover:scale-110 origin-bottom"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrafikPerSila;
