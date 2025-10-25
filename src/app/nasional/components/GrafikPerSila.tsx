"use client";
import { FC, useMemo } from "react";
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
  // 🔎 Ringkasan: sila tertinggi & terendah (atau semua sama)
  const summarySila = useMemo(() => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => b.Nilai - a.Nilai);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];

    if (top.Nilai === bottom.Nilai) {
      return { type: "equal" as const, nilai: top.Nilai };
    }
    return { type: "ok" as const, top, bottom };
  }, [data]);

  return (
    <div
      className="p-4 rounded-xl backdrop-blur-sm shadow-lg border border-blue-200"
      style={{ backgroundImage: "url('/bg/bg7.jpg')" }}
    >
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

      {/* 📝 Keterangan tertinggi & terendah */}
      {summarySila && summarySila.type === "ok" && (
        <p className="mt-2 text-xs text-gray-800 text-justify">
          <span className="font-semibold">{summarySila.top.Sila}</span> merupakan sila
          dengan capaian tertinggi pada tahun <span className="font-semibold">{tahun}</span> yaitu{" "}
          <span className="font-semibold">{summarySila.top.Nilai.toFixed(2)}</span>, sedangkan{" "}
          <span className="font-semibold">{summarySila.bottom.Sila}</span> memiliki capaian terendah yaitu{" "}
          <span className="font-semibold">{summarySila.bottom.Nilai.toFixed(2)}</span>.
        </p>
      )}
      {summarySila && summarySila.type === "equal" && (
        <p className="mt-2 text-xs text-gray-800 text-justify">
          Seluruh sila pada tahun <span className="font-semibold">{tahun}</span> memiliki capaian yang sama, yaitu{" "}
          <span className="font-semibold">{summarySila.nilai.toFixed(2)}</span>.
        </p>
      )}
    </div>
  );
};

export default GrafikPerSila;
