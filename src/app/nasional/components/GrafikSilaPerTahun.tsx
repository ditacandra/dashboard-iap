"use client";
import { FC, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

// Tambahkan Growth opsional
export interface DataPerSila {
  Sila: string;
  NamaSila: string;
  Tahun: number;
  Nilai: number;
  Growth?: number; // growth dalam %
}

interface GrafikSilaPerTahunProps {
  data: DataPerSila[];
  silaColors: Record<string, string>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow text-gray-900">
        <p className="font-semibold">{d.Sila}</p>
        <p>{`Nilai: ${d.Nilai.toFixed(2)}`}</p>
        {d.Growth !== undefined && (
          <p
            className={`font-medium ${
              d.Growth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {`Growth: ${d.Growth >= 0 ? "+" : ""}${d.Growth.toFixed(1)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// === Custom Label untuk Growth ===
const GrowthLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (typeof value !== "number") return null;

  const color = value >= 0 ? "green" : "red";
  const text = `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill={color}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
    >
      {text}
    </text>
  );
};

const GrafikSilaPerTahun: FC<GrafikSilaPerTahunProps> = ({ data, silaColors }) => {
  // Hitung growth % per sila
  const dataWithGrowth = useMemo(() => {
    const grouped: Record<string, DataPerSila[]> = {};
    data.forEach((d) => {
      if (!grouped[d.Sila]) grouped[d.Sila] = [];
      grouped[d.Sila].push({ ...d });
    });

    Object.keys(grouped).forEach((sila) => {
      grouped[sila].sort((a, b) => a.Tahun - b.Tahun);
      for (let i = 1; i < grouped[sila].length; i++) {
        const prev = grouped[sila][i - 1];
        const curr = grouped[sila][i];
        if (prev.Nilai !== 0) {
          curr.Growth = ((curr.Nilai - prev.Nilai) / prev.Nilai) * 100;
        } else {
          curr.Growth = undefined;
        }
      }
    });

    return Object.values(grouped).flat();
  }, [data]);

  return (
    <div className="p-4 rounded-xl backdrop-blur-sm shadow-lg border border-purple-200"
    style={{ backgroundImage: "url('/bg/bg7.jpg')" }}>
      <h3 className="font-semibold text-center text-purple-900 mb-2">
        Trend Indeks Sila Penyusun IAP
      </h3>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart
          data={dataWithGrowth}
          barCategoryGap="10%"
          margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="Tahun" tick={{ fontSize: 10, fill: "black" }} />
          <YAxis
            tick={{ fontSize: 10, fill: "black" }}
            domain={[0, (dataMax: number) => Math.ceil((dataMax + 5) / 10) * 10]}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Nilai" radius={[6, 6, 0, 0]}>
            {dataWithGrowth.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={silaColors[entry.Sila] || "#8884d8"}
              />
            ))}
            {/* Custom label growth */}
            <LabelList dataKey="Growth" content={<GrowthLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrafikSilaPerTahun;
