"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { provinsiList } from "@/lib/provinsiList";
import DeskripsiProvinsi from "../components/DeskripsiProvinsi";
import GrafikTrendIAPTahun from "../components/GrafikTrendIAPTahun";
import RadarSilaChart from "../components/RadarSilaChart";
import FilterSila from "../components/FilterSila";
import GrafikSilaProvinsi from "../components/GrafikSilaProvinsi";
import GrafikIndikatorProvinsi from "../components/GrafikIndikatorProvinsi";

export default function ProvinsiPage() {
  const params = useParams();
  const id = params?.id as string;
  const provinsi = provinsiList.find((p) => p.id === id);

  const namaProvinsi = provinsi?.name || "Tidak Diketahui";

  // state untuk filter sila
  const [sila, setSila] = useState("1");

  return (
    <main className="min-h-screen px-6 py-10 bg-gray-50"
    style={{ backgroundImage: "url('/bg/bg.png')" }}>
      {/* Section 1: Deskripsi Provinsi */}
      <DeskripsiProvinsi namaProvinsi={namaProvinsi} />

      {/* Section 2: Grafik Tren IAP + Radar Sila */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kiri: Grafik Tren IAP */}
        <div className="w-full aspect-[4/3] p-4 rounded-xl shadow"
        style={{ backgroundImage: "url('/bg/bg.png')" }}>
          <GrafikTrendIAPTahun namaProvinsi={namaProvinsi} />
        </div>

        {/* Kanan: Radar Sila */}
        <div className="w-full aspect-[4/3] p-4 rounded-xl shadow flex items-center justify-center"
        style={{ backgroundImage: "url('/bg/bg.png')" }}>
          <RadarSilaChart namaProvinsi={namaProvinsi} />
        </div>
      </div>

      {/* Section 3 & 4: Grafik Sila + Grafik Indikator */}
      <div className="mt-10">
        {/* Filter Sila */}
        <FilterSila selectedSila={sila} onChange={setSila} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Grafik Sila (35%) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-xl shadow"
          style={{ backgroundImage: "url('/bg/bg.png')" }}>
            <GrafikSilaProvinsi namaProvinsi={namaProvinsi} sila={sila} />
          </div>

          {/* Grafik Indikator (65%) */}
          <div className="lg:col-span-8 bg-white p-4 rounded-xl shadow"
          style={{ backgroundImage: "url('/bg/bg.png')" }}>
            <GrafikIndikatorProvinsi namaProvinsi={namaProvinsi} sila={sila} />
          </div>
        </div>
      </div>
    </main>
  );
}
