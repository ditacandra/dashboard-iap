"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

import FilterTahun from "./components/FilterTahun";
import FilterSila from "./components/FilterSila";
import GrafikPerTahun from "./components/GrafikPerTahun";
import GrafikPerSila from "./components/GrafikPerSila";
import GrafikPerIndikator from "./components/GrafikPerIndikator";
import GrafikSilaPerTahun from "./components/GrafikSilaPerTahun";
import GrafikIndikatorPerTahun from "./components/GrafikIndikatorPerTahun";
import TabelPerSila from "./components/TabelPerSila";
import PrioritasNasional from "./components/PrioritasNasional";

import { DataPerSila, DataPerIndikator } from "./components/types";

interface DataPerTahun {
  Tahun: number;
  Nilai: number;
  Delta?: number;
}

export default function NasionalPage() {
  const [tahunTerpilih, setTahunTerpilih] = useState<number>(2023);
  const [silaTerpilih, setSilaTerpilih] = useState<string>("Sila 1");

  const [dataPerTahun, setDataPerTahun] = useState<DataPerTahun[]>([]);
  const [dataPerSila, setDataPerSila] = useState<DataPerSila[]>([]);
  const [dataPerIndikator, setDataPerIndikator] = useState<DataPerIndikator[]>([]);
  const [daftarTahun, setDaftarTahun] = useState<number[]>([]);
  const [daftarSila, setDaftarSila] = useState<string[]>([]);

  const silaColors: Record<string, string> = {
    "Sila 1": "#D32F2F",
    "Sila 2": "#F57C00",
    "Sila 3": "#FBC02D",
    "Sila 4": "#388E3C",
    "Sila 5": "#1976D2",
  };

  useEffect(() => {
    const fetchExcel = async () => {
      const response = await fetch("/data/data_fixed.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      // Data Per Tahun
      const sheetTahun = XLSX.utils.sheet_to_json(workbook.Sheets["IAP_TAHUN"]) as any[];
      const dataTahun: DataPerTahun[] = sheetTahun.map((row: any) => ({
        Tahun: Number(row.Tahun),
        Nilai: Number(row.Nilai),
        Delta: row.Delta ? Number(row.Delta) : undefined,
      }));
      setDataPerTahun(dataTahun);
      setDaftarTahun(Array.from(new Set(dataTahun.map((d) => d.Tahun))).sort((a, b) => a - b));

      // Data Per Sila
      const sheetSila = XLSX.utils.sheet_to_json(workbook.Sheets["PER_SILA"]) as any[];
      const dataSila: DataPerSila[] = sheetSila.map((row: any) => ({
        Sila: row.Sila,
        NamaSila: row.NamaSila,
        Tahun: Number(row.Tahun),
        Nilai: Number(row.Nilai),
        Delta: row.Delta ? Number(row.Delta) : undefined,
      }));
      setDataPerSila(dataSila);
      setDaftarSila(Array.from(new Set(dataSila.map((d) => d.Sila))).sort());

      // Data Per Indikator
      const sheetIndikator = XLSX.utils.sheet_to_json(workbook.Sheets["PER_INDIKATOR"]) as any[];
      const dataIndikator: DataPerIndikator[] = sheetIndikator.map((row: any) => ({
        Sila: row.Sila,
        NamaSila: row.NamaSila ?? row.NamaSila,
        Indikator: row.Indikator,
        IndikatorNama: row.IndikatorNama,
        Tahun: Number(row.Tahun),
        Nilai: Number(row.Nilai),
      }));
      setDataPerIndikator(dataIndikator);
    };

    fetchExcel();
  }, []);

  // Filter data untuk grafik per tahun
  const filteredSila = dataPerSila.filter((d) => d.Tahun === tahunTerpilih);
  const filteredIndikator = dataPerIndikator.filter((d) => d.Tahun === tahunTerpilih);

  // Filter data untuk grafik per Sila
  const filteredSilaPerTahun = dataPerSila.filter((d) => d.Sila === silaTerpilih);
  const filteredIndikatorPerTahun = dataPerIndikator.filter((d) => d.Sila === silaTerpilih);

  // Pivot data untuk TabelPerSila
  const pivotedSila = dataPerSila.reduce((acc: any[], cur) => {
    let row = acc.find((r) => r.Sila === cur.Sila);
    if (!row) {
      row = {
        Sila: cur.Sila,
        NamaSila: cur.NamaSila,
        Tahun2021: null,
        Tahun2023: null,
        Tahun2024: null,
      };
      acc.push(row);
    }
    row[`Tahun${cur.Tahun}`] = cur.Nilai;
    return acc;
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/bg7.jpg')" }}
    >
      <div className="p-6 pt-10">
        {/* Judul Atas */}
        <div className="text-center mb-10">
        
          <h1
            className="mt-4 text-3xl md:text-4xl font-extrabold 
            bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 
            bg-clip-text text-transparent tracking-wide drop-shadow-lg"
          >
            INDEKS AKTUALISASI PANCASILA (IAP) NASIONAL
          </h1>
        <div className="mt-2 text-3xl md:text-3xl font-extrabold 
            bg-gradient-to-r from-red-600 via-yellow-500 to-blue-600 
            bg-clip-text text-transparent tracking-wide drop-shadow-lg">
        <p>
          2021-2025
        </p>
        </div>

          <div className="mt-2 h-1 w-40 bg-gradient-to-r from-red-500 to-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Prioritas Nasional */}
        <div className="mb-12">
          <PrioritasNasional />
        </div>

        {/* Grafik Per Tahun */}
        <div className="mb-8 p-4 rounded-2xl bg-white backdrop-blur-sm shadow-lg border border-gray-200"
      >
          <GrafikPerTahun data={dataPerTahun} />
        </div>

        {/* Filter Tahun */}
        <div className="flex justify-center mb-4">
          <FilterTahun
            tahunTerpilih={tahunTerpilih}
            setTahunTerpilih={setTahunTerpilih}
            daftarTahun={daftarTahun}
          />
        </div>

        {/* Grafik Per Sila & Per Indikator */}
        <div className="mb-8 grid grid-cols-12 gap-4">
        <div
            className="col-span-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg border border-gray-200"
            style={{ height: 330 }}
          >
            <GrafikPerSila data={filteredSila} tahun={tahunTerpilih} />
          </div>
          <div
            className="col-span-8 p-4 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg border border-gray-200"
            style={{ height: 330 }}
          >
            <GrafikPerIndikator
              data={filteredIndikator}
              tahun={tahunTerpilih}
              silaColors={silaColors}
            />
          </div>
        </div>

        {/* Filter Sila */}
        <div className="flex justify-center mb-4">
          <FilterSila
            silaTerpilih={silaTerpilih}
            setSilaTerpilih={setSilaTerpilih}
            daftarSila={daftarSila}
          />
        </div>

        {/* Grafik SilaPerTahun & IndikatorPerTahun */}
        <div className="mb-8 grid grid-cols-12 gap-4">
          <div
            className="col-span-4 p-4 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg border border-gray-200"
            style={{ height: 330 }}
          >
            <GrafikSilaPerTahun data={filteredSilaPerTahun} silaColors={silaColors} />
          </div>
          <div
            className="col-span-8 p-4 rounded-2xl bg-white/50 backdrop-blur-sm shadow-lg border border-gray-200"
            style={{ height: 330 }}
          >
            <GrafikIndikatorPerTahun
              data={filteredIndikatorPerTahun}
              silaColors={silaColors}
            />
          </div>
        </div>

        {/* Tabel Per Sila */}
        <div className="p-6 text-center rounded-2xl bg-white/60 backdrop-blur-md shadow-xl border border-gray-300 mt-10 pb-10">
          <TabelPerSila data={pivotedSila} />
        </div>
      </div>
    </div>
  );
}
