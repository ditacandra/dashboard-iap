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

interface GrafikSilaProvinsiFilterProps {
  tahun: number;
}

// ✅ Warna sama persis dengan GrafikSilaProvinsi
const colors = ["#D9D9D9", "#A6A6A6", "#7F7F7F", "#F4B183", "#ED7D31", "#B40000"];
const indonesiaColors = [
  "#cce9b9ff",
  "#88a674ff",
  "#70AD47",
  "#2ca02c",
  "#548235",
  "#385723",
];

const GrafikSilaProvinsiFilter: FC<GrafikSilaProvinsiFilterProps> = ({ tahun }) => {
  const [data, setData] = useState<DataSilaProvinsi[]>([]);
  const [silaTerpilih, setSilaTerpilih] = useState<string>("Sila 1");

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

  // Filter sesuai tahun & sila
  const filtered = useMemo(
    () => data.filter((d) => d.Tahun === tahun && d.Sila === silaTerpilih),
    [data, tahun, silaTerpilih]
  );

  // Urutkan provinsi
  const grouped = useMemo(() => {
    return [...filtered].sort((a, b) => a.Nilai - b.Nilai);
  }, [filtered]);

  // Ambil daftar sila
  const daftarSila = useMemo(
    () => Array.from(new Set(data.map((d) => d.Sila))),
    [data]
  );

  // Ambil index sila terpilih → untuk pilih warna
  const silaIndex = daftarSila.indexOf(silaTerpilih);

  return (
    <div className="w-full h-[600px] p-4 bg-white rounded-2xl shadow mt-6 mb-6">
      <h2 className="text-xl font-semibold text-black mb-4 text-center">
        Capaian IAP per Provinsi – {silaTerpilih} – Tahun {tahun}
      </h2>

      {/* Filter sila */}
      <div className="flex justify-center mb-4">
        <select
          value={silaTerpilih}
          onChange={(e) => setSilaTerpilih(e.target.value)}
          className="p-2 rounded border border-gray-300 text-sm"
        >
          {daftarSila.map((sila, i) => (
            <option key={i} value={sila}>
              {sila}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={grouped}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 1, bottom: 10 }}
        >
          <XAxis type="number" fontSize={12} tick={{ fill: "black" }} />
          <YAxis
            type="category"
            dataKey="Provinsi"
            fontSize={9}
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
          <Bar dataKey="Nilai" barSize={20}>
            {grouped.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={
                  entry.Provinsi === "Indonesia"
                    ? indonesiaColors[silaIndex % indonesiaColors.length]
                    : colors[silaIndex % colors.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrafikSilaProvinsiFilter;
