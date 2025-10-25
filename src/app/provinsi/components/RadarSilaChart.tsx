"use client";
import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface DataSilaProvinsi {
  Provinsi: string;
  Tahun: number;
  Sila: string;
  Nilai: number;
}

interface DataTahunProvinsi {
  Provinsi: string;
  Tahun: number;
  Nilai: number;
}

interface RadarSilaChartProps {
  namaProvinsi: string;
}

const RadarSilaChart: React.FC<RadarSilaChartProps> = ({ namaProvinsi }) => {
  const [data, setData] = useState<DataSilaProvinsi[]>([]);
  const [iapData, setIapData] = useState<DataTahunProvinsi[]>([]);
  const [tahunList, setTahunList] = useState<number[]>([]);
  const [tahun, setTahun] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const file = await fetch("/data/data_fixed.xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // --- Data Sila per Provinsi ---
      const sheetSila = workbook.Sheets["SILA_PROVINSI"];
      const jsonSila: any[] = XLSX.utils.sheet_to_json(sheetSila);

      const filteredSila = jsonSila.filter(
        (row) => row.Provinsi?.toLowerCase() === namaProvinsi.toLowerCase()
      );

      const mappedSila = filteredSila.map((row) => ({
        Provinsi: row.Provinsi,
        Tahun: Number(row.Tahun),
        Sila: row.Sila,
        Nilai: Number(Number(row.Nilai).toFixed(2)),
      }));

      // --- Data IAP per Tahun & Provinsi ---
      const sheetIap = workbook.Sheets["TAHUN_PROVINSI"];
      const jsonIap: any[] = XLSX.utils.sheet_to_json(sheetIap);

      const filteredIap = jsonIap.filter(
        (row) => row.Provinsi?.toLowerCase() === namaProvinsi.toLowerCase()
      );

      const mappedIap = filteredIap.map((row) => ({
        Provinsi: row.Provinsi,
        Tahun: Number(row.Tahun),
        Nilai: Number(Number(row.Nilai).toFixed(2)),
      }));

      // --- Daftar Tahun ---
      const uniqueYears = Array.from(new Set(mappedSila.map((d) => d.Tahun))).sort();

      setData(mappedSila);
      setIapData(mappedIap);
      setTahunList(uniqueYears);
      setTahun(uniqueYears[uniqueYears.length - 1]); // default ke tahun terbaru
    };

    fetchData();
  }, [namaProvinsi]);

  // Filter data radar untuk tahun terpilih (exclude IAP)
  const filteredRadar = useMemo(
    () => data.filter((d) => d.Tahun === tahun && d.Sila.toLowerCase() !== "iap"),
    [data, tahun]
  );

  // Ambil nilai IAP untuk deskripsi
  const nilaiIap = useMemo(
    () => iapData.find((d) => d.Tahun === tahun)?.Nilai ?? null,
    [iapData, tahun]
  );

  // 🔹 Ringkasan: sila dengan capaian tertinggi & terendah
  const summary = useMemo(() => {
    if (!filteredRadar.length) return null;

    const maxVal = Math.max(...filteredRadar.map((r) => r.Nilai));
    const minVal = Math.min(...filteredRadar.map((r) => r.Nilai));

    const top = filteredRadar.filter((r) => r.Nilai === maxVal).map((r) => r.Sila);
    const bottom = filteredRadar.filter((r) => r.Nilai === minVal).map((r) => r.Sila);

    const join = (arr: string[]) =>
      arr.length <= 2 ? arr.join(" dan ") : arr.slice(0, -1).join(", ") + " dan " + arr[arr.length - 1];

    return {
      topNames: join(top),
      bottomNames: join(bottom),
      maxVal,
      minVal,
    };
  }, [filteredRadar]);

  return (
    <div className="w-full p-4 bg-blue-50 rounded-xl">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Indeks Aktualisasi Pancasila per Sila – {namaProvinsi}
      </h2>

      {/* Filter Tahun */}
      <div className="mb-4">
        <label className="mr-2 font-medium text-gray-800">Filter Tahun:</label>
        <select
          className="border border-gray-400 rounded px-2 py-1 text-black"
          value={tahun ?? ""}
          onChange={(e) => setTahun(Number(e.target.value))}
        >
          {tahunList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={271}>
        <RadarChart data={filteredRadar}>
          <PolarGrid />
          <PolarAngleAxis dataKey="Sila" />
          <PolarRadiusAxis domain={[0, 100]} />
          <Radar
            name="Nilai"
            dataKey="Nilai"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "white", color: "black" }}
            formatter={(value: number) => value.toFixed(2)}
            labelFormatter={(label) => `${label}`}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Nilai IAP */}
      {nilaiIap !== null && (
        <p className="mt-4 text-center text-gray-700 font-semibold">
          Indeks Aktualisasi Pancasila {tahun} :{" "}
          <span className="text-blue-600">{nilaiIap.toFixed(2)}</span>
        </p>
      )}

      {/* 🔹 Keterangan tambahan (paling bawah) */}
      {summary && tahun !== null && (
        <p className="mt-3 text-sm text-gray-800 text-justify">
          <span className="font-semibold">{summary.topNames}</span> merupakan sila
          dengan capaian IAP tertinggi di Provinsi{" "}
          <span className="font-semibold">{namaProvinsi}</span> pada tahun{" "}
          <span className="font-semibold">{tahun}</span> dengan nilai capaian{" "}
          <span className="font-semibold">{summary.maxVal.toFixed(2)}</span>.{" "}
          Dan <span className="font-semibold">{summary.bottomNames}</span> merupakan
          sila dengan capaian IAP terendah yaitu{" "}
          <span className="font-semibold">{summary.minVal.toFixed(2)}</span>.
        </p>
      )}
    </div>
  );
};

export default RadarSilaChart;
