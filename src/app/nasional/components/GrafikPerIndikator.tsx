"use client";
import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataPerIndikator {
  Sila: string;
  NamaSila: string;
  Indikator: string;
  IndikatorNama: string;
  Tahun: number;
  Nilai: number;
}

interface GrafikPerIndikatorProps {
  data: DataPerIndikator[];
  tahun: number;
  silaColors: Record<string, string>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded shadow text-gray-900 max-w-[250px] whitespace-normal break-words">
        <p className="font-semibold">{payload[0].payload.Indikator}</p>
        <p className="text-xs italic">{payload[0].payload.IndikatorNama}</p>
        <p>{`Nilai: ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const GrafikPerIndikator: FC<GrafikPerIndikatorProps> = ({
  data,
  tahun,
  silaColors,
}) => {
  // Tambahkan jeda antar Sila
  const dataWithGaps: any[] = [];
  let lastSila = "";
  data.forEach((item) => {
    if (lastSila && lastSila !== item.Sila) {
      dataWithGaps.push({ Indikator: "", Sila: "" }); // gap
    }
    dataWithGaps.push(item);
    lastSila = item.Sila;
  });

  // Hitung posisi tengah tiap Sila
  const silaTicks: number[] = [];
  const silaLabels: Record<number, string> = {};
  lastSila = "";
  let startIndex = 0;
  dataWithGaps.forEach((item, idx) => {
    if (item.Sila !== lastSila) {
      if (lastSila !== "" && startIndex < idx - 1) {
        const mid = Math.floor((startIndex + idx - 1) / 2);
        silaTicks.push(mid);
        silaLabels[mid] = lastSila;
      }
      lastSila = item.Sila;
      startIndex = idx;
    }
  });
  if (lastSila !== "") {
    const mid = Math.floor((startIndex + dataWithGaps.length - 1) / 2);
    silaTicks.push(mid);
    silaLabels[mid] = lastSila;
  }

  return (
    <div className="p-4 rounded-xl backdrop-blur-sm shadow-lg border border-blue-200"
    style={{ backgroundImage: "url('/bg/bg7.jpg')" }}>
      <h3 className="font-semibold text-center text-blue-900 mb-2">
        Indeks per Indikator IAP Tahun {tahun}
      </h3>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={dataWithGaps} barCategoryGap="5%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          {/* XAxis untuk indikator */}
          <XAxis
            xAxisId="indeks"
            dataKey="Indikator"
            tick={{ fontSize: 10, fill: "black" }}
            interval={0}
            angle={-20}
            textAnchor="end"
          />
          {/* XAxis untuk Sila */}
          <XAxis
            xAxisId="sila"
            orientation="bottom"
            axisLine={false}
            tickLine={false}
            y={280}
            ticks={silaTicks}
            tick={({ x, y, payload }) => (
              <text
                x={x}
                y={240}
                textAnchor="middle"
                fontSize={12}
                fill="black"
              >
                {silaLabels[payload.value]}
              </text>
            )}
          />
          <YAxis tick={{ fontSize: 10, fill: "black" }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Nilai" animationDuration={800} radius={[6, 6, 0, 0]}>
            {dataWithGaps.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={silaColors[entry.Sila] || "#ccc"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrafikPerIndikator;
