"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface DataTahunProvinsi {
  Tahun: number;
  Provinsi: string;
  Nilai: number;
  Growth?: number | null;
}

interface GrafikTrendIAPTahunProps {
  namaProvinsi: string;
}

const GrafikTrendIAPTahun: React.FC<GrafikTrendIAPTahunProps> = ({
  namaProvinsi,
}) => {
  const [data, setData] = useState<DataTahunProvinsi[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const file = await fetch("/data/data_fixed.xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets["TAHUN_PROVINSI"];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const filtered = json.filter(
        (row) => row.Provinsi?.toLowerCase() === namaProvinsi.toLowerCase()
      );

      const sorted = filtered.sort((a, b) => a.Tahun - b.Tahun);

      const withGrowth = sorted.map((row, index) => {
        if (index === 0) return { ...row, Growth: null };
        const prev = sorted[index - 1].Nilai;
        const growth = +(row.Nilai - prev).toFixed(2);
        return { ...row, Growth: growth };
      });

      setData(withGrowth);
    };

    fetchData();
  }, [namaProvinsi]);

  const getDeskripsi = () => {
    if (data.length < 2) return "";
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (last.Nilai > prev.Nilai) {
      return `Capaian IAP pada tahun ${last.Tahun} mengalami kenaikan dibandingkan tahun ${prev.Tahun}, dan lebih tinggi dibanding tahun ${data[0].Tahun}.`;
    } else if (last.Nilai < prev.Nilai) {
      return `Capaian IAP pada tahun ${last.Tahun} mengalami penurunan dibandingkan tahun ${prev.Tahun}, namun masih lebih tinggi dibanding tahun ${data[0].Tahun}.`;
    } else {
      return `Capaian IAP pada tahun ${last.Tahun} sama dengan tahun ${prev.Tahun}.`;
    }
  };

  const colors = ["#FFEB3B", "#FFC107", "#FF5722", "#FF6F61"];

  return (
    <div className="w-full p-4 bg-red-50 rounded-xl">
      <h2 className="text-xl font-bold text-red-600 mb-4">
        Tren Capaian IAP {namaProvinsi} 2021–2024
      </h2>
      <ResponsiveContainer width="100%" height={370}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 80, left: 20, bottom: 10 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="Tahun" hide />
          <Bar
            dataKey="Nilai"
            radius={[50, 50, 50, 50]}
            activeBar={{
              style: {
                transform: "scaleX(1.05)",
                transformOrigin: "left center",
                transition: "transform 0.3s ease",
                filter: "drop-shadow(0 0 6px rgba(0,0,0,0.2))",
              },
            }}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}

            {/* Tahun di dalam kiri bar */}
            <LabelList
              dataKey="Tahun"
              position="insideLeft"
              style={{
                fill: "white",
                fontWeight: "bold",
                pointerEvents: "none",
              }}
            />

            {/* Nilai di dalam kanan bar */}
            <LabelList
              dataKey="Nilai"
              position="insideRight"
              formatter={(val: any) =>
                val !== undefined && val !== null ? Number(val).toFixed(2) : ""
              }
              style={{
                fill: "white",
                fontWeight: "bold",
                pointerEvents: "none",
              }}
            />

            {/* Growth di luar kanan bar */}
            <LabelList
              dataKey="Growth"
              content={(props) => {
                const { x, y, width, height, value } = props;
                if (value === "" || value == null) return null;

                const num = Number(value);
                const arrow = num >= 0 ? "▲" : "▼";

                return (
                  <text
                    x={Number(x) + Number(width) + 10}
                    y={Number(y) + Number(height) / 2}
                    fill={num >= 0 ? "green" : "red"}
                    fontWeight="bold"
                    fontSize={12}
                    dominantBaseline="middle"
                    pointerEvents="none"
                  >
                    {arrow} {Math.abs(num).toFixed(2)}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="mt-4 text-gray-700 text-sm">{getDeskripsi()}</p>
    </div>
  );
};

export default GrafikTrendIAPTahun;
