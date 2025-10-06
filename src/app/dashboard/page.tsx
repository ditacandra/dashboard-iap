"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { provinsiList } from "@/lib/provinsiList";
import FilterTahun from "../components/FilterTahun";
import GrafikSilaProvinsi from "../components/GrafikSilaProvinsi";
import GrafikSilaProvinsiFilter from "../components/GrafikSilaProvinsiFilter";
import TabelProvinsi from "../components/TabelProvinsi";

export default function DashboardPage() {
  const [tahun, setTahun] = useState(2023);
  const daftarTahun = [2021, 2022, 2023, 2024];
  const router = useRouter();

  // Hilangkan opsi "Semua Provinsi" (id=10)
  const daftarProvinsi = provinsiList.filter((p) => p.id !== "10");

  return (
    <div
      className="p-6 min-h-screen text-black bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/bg5.jpg')" }}
    >
      {/* Baris 1: Filter provinsi */}
      <div className="flex justify-end mb-12">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">Halaman Provinsi:</span>
          <select
            className="border rounded px-2 py-1 bg-white text-black"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (val) router.push(`/provinsi/${val}`);
            }}
          >
            <option value="" disabled>
              Pilih Provinsi
            </option>
            {daftarProvinsi.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Judul */}
      <h1 className="text-3xl text-white text-center font-bold mb-10">
        INDEKS AKTUALISASI PANCASILA (IAP) NASIONAL: 2021-2024
      </h1>

      {/* Filter Tahun */}
      <FilterTahun tahun={tahun} setTahun={setTahun} daftarTahun={daftarTahun} />

      {/* Dua Grafik Berdampingan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6 px-6"
      style={{ backgroundImage: "url('/bg/bg.png')" }}>
        {/* Grafik stacked semua sila */}
        <GrafikSilaProvinsi tahun={tahun} />

        {/* Grafik filter per sila */}
        <GrafikSilaProvinsiFilter tahun={tahun} />
      </div>

      {/* Tabel Provinsi */}
      <div className="px-1 pb-1"
      style={{ backgroundImage: "url('/bg/bg.png')" }}>
        <TabelProvinsi />
      </div>
    </div>
  );
}
