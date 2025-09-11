"use client";
import { FC, useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import * as XLSX from "xlsx";

interface DataSilaProvinsi {
  Sila: string;
  Provinsi: string;
  Tahun: number;
  Nilai: number;
}

interface GrafikSilaProvinsiProps {
  tahun: number;
}

const colors = [
  "#D9D9D9",
  "#A6A6A6",
  "#7F7F7F",
  "#F4B183",
  "#ED7D31",
  "#B40000",
];
const indonesiaColors = [
  "#cce9b9ff",
  "#88a674ff",
  "#70AD47",
  "#2ca02c",
  "#548235",
  "#385723",
];

const GrafikSilaProvinsi: FC<GrafikSilaProvinsiProps> = ({ tahun }) => {
  const [data, setData] = useState<DataSilaProvinsi[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/data/data_fixed.xlsx");
      const buf = await res.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets["SILA_PROVINSI"];
      const json: DataSilaProvinsi[] = XLSX.utils.sheet_to_json(ws);
      setData(json);
    };
    load();
  }, []);

  const filtered = useMemo(
    () => data.filter((d) => d.Tahun === tahun),
    [data, tahun]
  );

  const uniqueSila = useMemo(
    () => Array.from(new Set(filtered.map((d) => d.Sila))),
    [filtered]
  );

  const grouped = useMemo(() => {
    const map: Record<string, any> = {};
    filtered.forEach((row) => {
      if (!map[row.Provinsi]) {
        map[row.Provinsi] = { Provinsi: row.Provinsi, total: 0 };
      }
      map[row.Provinsi][row.Sila] = row.Nilai;
      map[row.Provinsi].total += row.Nilai;
    });
    return Object.values(map).sort((a, b) => a.total - b.total);
  }, [filtered]);

  const legendPayload = useMemo(
    () =>
      uniqueSila.map((sila, idx) => ({
        value: sila,
        color: colors[idx % colors.length],
      })),
    [uniqueSila]
  );

  return (
    <div className="w-full h-[600px] p-4 bg-white rounded-2xl shadow mt-6 mb-6">
      <h2 className="text-xl font-semibold text-black mb-4 text-center">
        Capaian IAP menurut kriteria dan Sila – Tahun {tahun}
      </h2>

      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={grouped}
          layout="vertical"
          margin={{ top: 20, right: 30, left: -80, bottom: 10 }}
        >
          <XAxis type="number" fontSize={12} tick={{ fill: "black" }} />
          <YAxis
            type="category"
            dataKey="Provinsi"
            fontSize={8}
            width={200}
            tick={{ fill: "black" }}
            interval={0}
          />
          <Tooltip
            formatter={(value: number) => value.toFixed(2)}
            contentStyle={{
              fontSize: "10px",
              padding: "4px 6px",
              borderRadius: "6px",
            }}
            itemStyle={{ fontSize: "10px" }}
            labelStyle={{ fontSize: "10px", fontWeight: "bold" }}
          />

          {uniqueSila.map((sila, idx) => (
            <Bar key={sila} dataKey={sila} stackId="a" barSize={20}>
              {grouped.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={
                    entry.Provinsi === "Indonesia"
                      ? indonesiaColors[idx % indonesiaColors.length]
                      : colors[idx % colors.length]
                  }
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend yang responsif */}
      <div className="mt-3 w-full max-w-full">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 overflow-hidden">
          {legendPayload.map((item) => (
            <div
              key={item.value}
              className="flex items-center space-x-2 whitespace-nowrap text-xs sm:text-sm"
            >
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  backgroundColor: item.color,
                  borderRadius: 2,
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.06) inset",
                }}
              />
              <span style={{ color: "black" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrafikSilaProvinsi;
