"use client";
import { FC } from "react";

interface DataPerSila {
  NamaSila: string;
  Tahun2021: number;
  Tahun2023: number;
  Tahun2024: number;
}

interface TabelPerSilaProps {
  data: DataPerSila[];
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const TabelPerSila: FC<TabelPerSilaProps> = ({ data }) => {
  return (
    <div
      className="overflow-x-auto p-4 rounded-xl shadow-md"
      style={{ backgroundImage: "url('/bg/bg7.jpg')" }}
    >
      <h3 className="font-semibold text-black mb-4 text-lg">
        Tabel Indeks Sila Penyusun IAP 2021, 2023, dan 2024
      </h3>
      {/* ✅ table-fixed supaya semua kolom patuh ke width */}
      <table className="min-w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-red-800 text-white">
            <th className="px-4 py-2 border border-gray-200 w-40">Sila</th>
            <th className="px-2 py-2 border border-gray-200 w-14">2021</th>
            <th className="px-2 py-2 border border-gray-200 w-14">2023</th>
            <th className="px-2 py-2 border border-gray-200 w-14">2024</th>
            <th className="px-2 py-2 border border-gray-200 w-14">
              Delta (2024 ke 2021)
            </th>
            <th className="px-2 py-2 border border-gray-200 w-14">
              Delta (2024 ke 2023)
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const delta21 = item.Tahun2024 - item.Tahun2021;
            const delta23 = item.Tahun2024 - item.Tahun2023;

            return (
              <tr
                key={idx}
                className={`text-left text-black transition-transform duration-300 hover:scale-[1.01] ${
                  idx % 2 === 0 ? "bg-yellow-50" : "bg-yellow-100"
                }`}
              >
                <td className="px-4 py-2 border border-gray-200 break-words">
                  {item.NamaSila}
                </td>
                <td className="px-2 py-2 border border-gray-200 text-center">
                  {formatNumber(item.Tahun2021)}
                </td>
                <td className="px-2 py-2 border border-gray-200 text-center">
                  {formatNumber(item.Tahun2023)}
                </td>
                <td className="px-2 py-2 border border-gray-200 text-center">
                  {formatNumber(item.Tahun2024)}
                </td>
                <td
                  className={`px-2 py-2 border border-gray-200 text-center break-words ${
                    delta21 >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatNumber(delta21)}
                </td>
                <td
                  className={`px-2 py-2 border border-gray-200 text-center break-words ${
                    delta23 >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatNumber(delta23)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TabelPerSila;
