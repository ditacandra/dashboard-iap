"use client";
import React, { useMemo } from "react";

interface DataPerTahun {
  Tahun: number;   // 0–100
  Nilai: number;
  Delta?: number;
}
interface GrafikPerTahunProps {
  data: DataPerTahun[];
}

const colorMap: Record<number, string> = {
  2021: "bg-yellow-300",
  2022: "bg-yellow-400",
  2023: "bg-orange-500",
  2024: "bg-red-400",
};

const format2 = (v: number) => v.toFixed(2);
const abs2 = (v: number) => Math.abs(v).toFixed(2);

const GrafikPerTahun: React.FC<GrafikPerTahunProps> = ({ data }) => {
  const rows = useMemo(() => [...data].sort((a, b) => a.Tahun - b.Tahun), [data]);

  // ambil nilai per tahun yang dibutuhkan
  const nilai2021 = rows.find((r) => r.Tahun === 2021)?.Nilai;
  const nilai2023 = rows.find((r) => r.Tahun === 2023)?.Nilai;
  const nilai2024 = rows.find((r) => r.Tahun === 2024)?.Nilai;

  // buat kalimat dinamis
  const insight = useMemo(() => {
    if (nilai2024 == null) return ""; // jika 2024 tidak ada, tidak usah tampilkan paragraf

    const parts: string[] = [];

    // bandingkan 2024 vs 2023
    if (nilai2023 != null) {
      const diff = nilai2024 - nilai2023;
      if (diff > 0) {
        parts.push(
          `pada tahun 2024 **meningkat** dibandingkan 2023 sebesar ${abs2(diff)} poin (dari ${format2(
            nilai2023
          )} menjadi ${format2(nilai2024)})`
        );
      } else if (diff < 0) {
        parts.push(
          `pada tahun 2024 **menurun** dibandingkan 2023 sebesar ${abs2(diff)} poin (dari ${format2(
            nilai2023
          )} menjadi ${format2(nilai2024)})`
        );
      } else {
        parts.push(
          `pada tahun 2024 **tetap** dibandingkan 2023 (tetap di ${format2(nilai2024)})`
        );
      }
    }

    // bandingkan 2024 vs 2021
    if (nilai2021 != null) {
      const diff = nilai2024 - nilai2021;
      if (diff > 0) {
        parts.push(
          `dan **meningkat** dibandingkan 2021 sebesar ${abs2(diff)} poin (dari ${format2(
            nilai2021
          )} menjadi ${format2(nilai2024)})`
        );
      } else if (diff < 0) {
        parts.push(
          `dan **menurun** dibandingkan 2021 sebesar ${abs2(diff)} poin (dari ${format2(
            nilai2021
          )} menjadi ${format2(nilai2024)})`
        );
      } else {
        parts.push(`dan **tetap** dibandingkan 2021 (tetap di ${format2(nilai2024)})`);
      }
    }

    if (parts.length === 0) return ""; // tidak ada pembanding
    return `Capaian IAP ${parts.join(", ")}.`;
  }, [nilai2021, nilai2023, nilai2024]);

  return (
    <div className="p-6 rounded-2xl backdrop-blur-sm shadow-lg border border-pink-200"
    style={{ backgroundImage: "url('/bg/bg7.jpg')" }}>
      <h2 className="text-xl font-bold mb-4 text-red-600">
        Tren Capaian IAP Nasional 2021–2024
      </h2>

      <div className="flex flex-col gap-4">
        {rows.map((item) => (
          <div key={item.Tahun} className="group flex items-center">
            {/* TRACK */}
            <div className="relative flex-1 h-10 rounded-full overflow-hidden ring-1 ring-black/5 transform transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg">
              {/* FILL */}
              <div
                className={`${colorMap[item.Tahun]} h-full rounded-full relative transition-[width] duration-300 ease-out pr-12`}
                style={{ width: `${item.Nilai}%` }}
              >
                {/* Tahun */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white font-semibold drop-shadow select-none">
                  {item.Tahun}
                </span>
                {/* Nilai */}
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white font-bold drop-shadow select-none">
                  {item.Nilai.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Growth */}
            {typeof item.Delta === "number" && (
              <span
                className={`ml-2 text-sm font-semibold ${
                  item.Delta >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.Delta >= 0 ? "▲" : "▼"} {Math.abs(item.Delta).toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>

      {insight && (
        <p className="mt-4 text-slate-700 text-sm">
          {/** pakai dangerouslySetInnerHTML agar **bold** di dalam string tampil */}
          <span
            dangerouslySetInnerHTML={{
              __html: insight.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
            }}
          />
        </p>
      )}
    </div>
  );
};

export default GrafikPerTahun;
