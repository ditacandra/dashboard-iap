"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from "react-qr-code"; // ✅ Tambahan: QR library
import { provinsiList } from "@/lib/provinsiList";

export default function Home() {
  const router = useRouter();
  const [selectedProvinsi, setSelectedProvinsi] = useState("");

  const handlePilihProvinsi = () => {
    if (!selectedProvinsi) return;
    router.push(`/login?provinsi=${selectedProvinsi}`);
  };

  const cardBase =
    "rounded-2xl shadow-md p-3 md:p-4 flex flex-col items-center justify-center min-h-[50px] md:min-h-[100px]";

  return (
    <main
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg/bg.png')" }}
    >
      <div className="flex flex-col md:flex-row min-h-screen px-6 md:px-16 bg-black/60 pt-12 md:pt-20">
        {/* Kiri */}
        <div className="flex-1 flex flex-col items-start text-left text-white pr-0 md:pr-12 mb-8 md:mb-0 relative">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            INDEKS AKTUALISASI PANCASILA
          </h1>

          <div className="mb-8">
            <p className="text-lg md:text-xl mb-1">
              Deputi Bidang Pengendalian & Evaluasi
            </p>
            <p className="text-sm md:text-base">
              Direktorat Pengukuran Pelembagaan Pancasila
            </p>
          </div>

          <Image
            src="/logo/bpip.png"
            alt="Logo BPIP"
            width={100}
            height={100}
            className="mb-6"
          />

          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Selamat Datang
          </h2>
          <p className="text-xs md:text-sm text-gray-200 italic -mt-1 mb-4">
            Data yang ada dalam dashboard ini masih dalam bentuk dummy (belum
            merupakan angka real capaian IAP).
          </p>

          {/* ✅ QR code kecil di kiri bawah teks */}
          <div className="flex items-center gap-2 bg-white/90 rounded-xl p-2 mt-2">
            <QRCode
              value="https://dashboard-iap.vercel.app/"
              size={64} // ukuran kecil agar rapi
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <span className="text-[10px] text-gray-700 font-medium leading-tight">
              Scan untuk <br /> buka Dashboard
            </span>
          </div>
        </div>

        {/* Kanan */}
        <div className="flex flex-col w-full md:w-[300px] pl-0 md:pl-16 mt-8 md:mt-20 gap-6">
          {/* NASIONAL → langsung masuk */}
          <div
            className={`${cardBase} bg-blue-500 text-white cursor-pointer hover:bg-blue-600 transition`}
            onClick={() => router.push("/nasional")}
          >
            <h2 className="text-xl font-semibold">NASIONAL</h2>
          </div>

          {/* PROVINSI → login dulu */}
          <div className={`${cardBase} bg-green-500 text-white`}>
            <h2 className="text-xl font-semibold mb-4">PROVINSI</h2>

            <div className="w-full">
              <select
                className="w-full p-2 rounded text-gray-900 bg-white"
                value={selectedProvinsi}
                onChange={(e) => setSelectedProvinsi(e.target.value)}
              >
                <option value="">-- Pilih Provinsi --</option>
                {provinsiList.map((prov) => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handlePilihProvinsi}
                disabled={!selectedProvinsi}
                className="mt-4 w-full py-2 rounded-lg bg-black text-white font-semibold disabled:opacity-50"
              >
                Lanjut
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
