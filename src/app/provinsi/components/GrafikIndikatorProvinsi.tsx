"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
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

interface DataIndikatorProvinsi {
  Tahun: number | string;
  Provinsi: string;
  Indikator: string;
  IndikatorNama: string;
  Nilai: number | null;
  Growth?: number | null;
  Sila: string;
  _isGap?: boolean;
  index?: number;
}

// === Custom Tooltip ===
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  const entry =
    payload.find(
      (p: any) =>
        p &&
        p.payload &&
        !p.payload._isGap &&
        p.payload.Nilai !== null &&
        p.payload.Nilai !== undefined
    ) || payload[0];

  if (!entry || !entry.payload) return null;

  const d: DataIndikatorProvinsi = entry.payload;
  if (d._isGap) return null;

  const nilaiRaw = entry.value ?? d.Nilai;
  const nilaiText =
    nilaiRaw === null || nilaiRaw === undefined || nilaiRaw === ""
      ? "-"
      : Number(nilaiRaw).toFixed(2);

  const growthText =
    d.Growth === null || d.Growth === undefined
      ? ""
      : ` (Growth: ${d.Growth.toFixed(1)}%)`;

  return (
    <div className="bg-white p-2 rounded shadow text-gray-900 max-w-[220px] whitespace-normal break-words text-sm">
      <p className="font-semibold">{d.Indikator}</p>
      <p className="text-xs italic">{d.IndikatorNama}</p>
      <p>{`Tahun: ${d.Tahun}`}</p>
      <p>{`Nilai: ${nilaiText}${growthText}`}</p>
    </div>
  );
};

// === Custom Growth Label ===
const CustomGrowthLabel = (props: any) => {
  const { x, y, value } = props;
  if (value === null || value === undefined) return null;

  const color = value < 0 ? "red" : "green";
  return (
    <text
      x={x}
      y={y - 4}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
      fill={color}
    >
      {`${value.toFixed(1)}%`}
    </text>
  );
};

interface GrafikIndikatorProvinsiProps {
  namaProvinsi: string;
  sila: string;
}

const GrafikIndikatorProvinsi: React.FC<GrafikIndikatorProvinsiProps> = ({
  namaProvinsi,
  sila,
}) => {
  const [dataWithIndex, setDataWithIndex] = useState<any[]>([]);
  const [IndikatorTicks, setIndikatorTicks] = useState<number[]>([]);
  const [IndikatorLabels, setIndikatorLabels] = useState<
    Record<number, string>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      const file = await fetch("/data/data_fixed.xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheet = workbook.Sheets["INDIKATOR_PROVINSI"];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const filtered = json.filter(
        (row) =>
          row.Provinsi?.toString().toLowerCase() ===
            namaProvinsi.toLowerCase() &&
          row.Sila?.toString().replace("Sila ", "") === sila
      );

      const cleaned: DataIndikatorProvinsi[] = filtered.map((row) => ({
        Tahun: Number(row.Tahun),
        Provinsi: row.Provinsi,
        Indikator: String(row.Indikator ?? ""),
        IndikatorNama: String(row.IndikatorNama ?? ""),
        Nilai:
          row.Nilai === null || row.Nilai === undefined
            ? null
            : Number(row.Nilai),
        Sila: String(row.Sila ?? ""),
      }));

      // urutkan dulu
      cleaned.sort((a, b) => {
        if (a.Indikator === b.Indikator) {
          return Number(a.Tahun) - Number(b.Tahun);
        }
        return a.Indikator.localeCompare(b.Indikator);
      });

      // hitung growth antar tahun per indikator
      const withGrowth: DataIndikatorProvinsi[] = [];
      let lastIndikator = "";
      let lastNilai: number | null = null;

      cleaned.forEach((item) => {
        let growth: number | null = null;
        if (
          item.Indikator === lastIndikator &&
          lastNilai !== null &&
          item.Nilai !== null
        ) {
          growth = ((item.Nilai - lastNilai) / lastNilai) * 100;
        }
        withGrowth.push({ ...item, Growth: growth });
        lastIndikator = item.Indikator;
        lastNilai = item.Nilai;
      });

      // tambahkan gap antar indikator
      const dataWithGaps: any[] = [];
      lastIndikator = "";
      withGrowth.forEach((item) => {
        if (lastIndikator && lastIndikator !== item.Indikator) {
          dataWithGaps.push({
            Tahun: "",
            Provinsi: "",
            Indikator: "",
            IndikatorNama: "",
            Nilai: null,
            Growth: null,
            Sila: "",
            _isGap: true,
          });
        }
        dataWithGaps.push(item);
        lastIndikator = item.Indikator;
      });

      // tambahkan index untuk axis indikator
      const withIndex = dataWithGaps.map((d, i) => ({ ...d, index: i }));

      // hitung posisi tengah tiap indikator
      const ticks: number[] = [];
      const labels: Record<number, string> = {};
      let startIndex = 0;
      lastIndikator = "";

      withIndex.forEach((item, idx) => {
        if (item.Indikator !== lastIndikator) {
          if (lastIndikator !== "" && startIndex < idx - 1) {
            const mid = Math.floor((startIndex + idx - 1) / 2);
            ticks.push(mid);
            labels[mid] = lastIndikator;
          }
          lastIndikator = item.Indikator;
          startIndex = idx;
        }
      });
      if (lastIndikator !== "") {
        const mid = Math.floor((startIndex + withIndex.length - 1) / 2);
        ticks.push(mid);
        labels[mid] = lastIndikator;
      }

      setDataWithIndex(withIndex);
      setIndikatorTicks(ticks);
      setIndikatorLabels(labels);
    };

    fetchData();
  }, [namaProvinsi, sila]);

  // === Warna konsisten per tahun ===
  const tahunColors: Record<number, string> = {
    2021: "#4CAF50",
    2022: "#2196F3",
    2023: "#FFC107",
    2024: "#FF5722",
  };

  return (
    <div className="w-full p-4 bg-blue-50 rounded-xl">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Tren Indikator – Sila {sila} – {namaProvinsi}
      </h2>

      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={dataWithIndex}
          margin={{ top: 16, right: 24, left: 12, bottom: 56 }}
          barCategoryGap="3%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          <YAxis
            type="number"
            domain={[0, 100]}
            tickCount={6}
            tick={{ fontSize: 10, fill: "black" }}
            label={{ value: "Nilai", angle: -90, position: "insideLeft" }}
          />

          {/* X Axis Tahun (dekat bar) */}
          <XAxis
            dataKey="Tahun"
            xAxisId="indeks"
            interval={0}
            angle={-20}
            textAnchor="end"
            tick={{ fontSize: 10, fill: "black" }}
            tickLine={false}
          />

          {/* X Axis Indikator (posisi tengah tiap grup) */}
          <XAxis
            dataKey="index"
            xAxisId="indikator"
            orientation="bottom"
            height={20}
            axisLine={false}
            tickLine={false}
            ticks={IndikatorTicks}
            tickFormatter={(val: any) =>
              typeof val === "number" ? IndikatorLabels[val] || "" : ""
            }
            tick={{ fontSize: 10, fill: "black", dy: 10 }}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Bar pakai XAxis "indeks" */}
          <Bar dataKey="Nilai" radius={[6, 6, 0, 0]} xAxisId="indeks">
            {dataWithIndex.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d._isGap
                    ? "transparent"
                    : tahunColors[d.Tahun as number] || "#9C27B0"
                }
              />
            ))}
            {/* Label growth custom */}
            <LabelList dataKey="Growth" content={<CustomGrowthLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrafikIndikatorProvinsi;
