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

interface DataSilaProvinsi {
  Tahun: number;
  Provinsi: string;
  Sila: number;
  Nilai: number;
  Growth?: number | null;
}

interface GrafikSilaProvinsiProps {
  namaProvinsi: string;
  sila: string; // "1" - "5"
}

const GrafikSilaProvinsi: React.FC<GrafikSilaProvinsiProps> = ({
  namaProvinsi,
  sila,
}) => {
  const [data, setData] = useState<DataSilaProvinsi[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const file = await fetch("/data/data_fixed.xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets["SILA_PROVINSI"];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const filtered = json.filter(
        (row) =>
          row.Provinsi?.toLowerCase() === namaProvinsi.toLowerCase() &&
          row.Sila?.toString().replace("Sila ", "") === sila
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
  }, [namaProvinsi, sila]);

  const colors = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722"];

  return (
    <div className="w-full p-4 bg-blue-50 rounded-xl">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Tren Capaian Sila {sila} – {namaProvinsi}
      </h2>
      <ResponsiveContainer width="100%" height={390}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 80, left: 20, bottom: 10 }}
        >
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="Tahun" hide />
          <Bar dataKey="Nilai" radius={[50, 50, 50, 50]}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
            <LabelList dataKey="Tahun" position="insideLeft" style={{ fill: "white", fontWeight: "bold" }} />
            <LabelList dataKey="Nilai" position="insideRight" formatter={(val: any) => val?.toFixed(2)} style={{ fill: "white", fontWeight: "bold" }} />
            <LabelList
              dataKey="Growth"
              content={(props) => {
                const { x, y, width, height, value } = props;
                if (value == null) return null;
                const num = Number(value);
                return (
                  <text
                    x={Number(x) + Number(width) + 10}
                    y={Number(y) + Number(height) / 2}
                    fill={num >= 0 ? "green" : "red"}
                    fontWeight="bold"
                    fontSize={12}
                    dominantBaseline="middle"
                  >
                    {num >= 0 ? "▲" : "▼"} {Math.abs(num).toFixed(2)}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrafikSilaProvinsi;
