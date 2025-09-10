// app/components/DeskripsiProvinsi.tsx
"use client";

import { useEffect, useState } from "react";

interface DeskripsiProvinsiProps {
  namaProvinsi: string;
}

interface IndikatorData {
  Sila: string;
  Indikator: string;
  IndikatorNama: string;
}

export default function DeskripsiProvinsi({ namaProvinsi }: DeskripsiProvinsiProps) {
  const [indikatorDetail, setIndikatorDetail] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/indikator");
        const data: IndikatorData[] = await res.json();

        // Pivot → group by Sila
        const grouped: Record<string, string[]> = {};
        data.forEach((item) => {
          const key = item.Sila;
          const value = `${item.Indikator} ${item.IndikatorNama}`;
          if (!grouped[key]) grouped[key] = [];
          if (!grouped[key].includes(value)) {
            grouped[key].push(value);
          }
        });

        setIndikatorDetail(grouped);
      } catch (error) {
        console.error("Gagal ambil data indikator:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow-md p-6 space-y-8">
      {/* Judul */}
      <h1 className="text-3xl font-bold text-gray-800">
        Indeks Aktualisasi Pancasila (IAP) Provinsi {namaProvinsi}
      </h1>

      {/* Deskripsi */}
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          Indeks Aktualisasi Pancasila (IAP) merupakan sebuah tolok ukur yang merefleksikan
          sejauh mana nilai-nilai Pancasila teraktualisasi dalam kehidupan berbangsa dan
          bernegara oleh seluruh lapisan masyarakat, tanpa terkecuali. IAP bertujuan untuk
          memperoleh gambaran yang komprehensif mengenai aktualisasi nilai-nilai Pancasila
          dalam kehidupan masyarakat berbangsa dan bernegara.
        </p>
        <p>
          Melalui IAP, tingkat aktualisasi tersebut dapat diketahui berdasarkan lima dimensi
          yang merepresentasikan kelima sila Pancasila.
        </p>
      </div>

      {/* Ringkasan Indikator */}
      <div className="bg-gray-50 border rounded-xl p-4">
        <h2 className="text-xl text-black font-semibold mb-2">
          Ringkasan Indikator IAP 2021-2024
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-600">
          <li>Sila 1 (Ketuhanan): 5 Indikator (X1.1 - X1.5)</li>
          <li>Sila 2 (Kemanusiaan): 4 Indikator (X2.1 - X2.4)</li>
          <li>Sila 3 (Persatuan): 5 Indikator (X3.1 - X3.5)</li>
          <li>Sila 4 (Kerakyatan): 4 Indikator (X4.1 - X4.4)</li>
          <li>Sila 5 (Keadilan Sosial): 5 Indikator (X5.1 - X5.5)</li>
        </ul>
      </div>

      {/* Bagan Visual */}
      <div>
        <h2 className="text-2xl text-black font-semibold mb-6">Indikator IAP 2021-2024</h2>
        <div className="flex flex-col items-start space-y-8">
          {Object.entries(indikatorDetail).map(([sila, indikatorList], idx) => (
            <div key={idx} className="w-full">
              {/* Sila Box */}
              <div className="flex items-center space-x-4">
                <div className="w-40 text-center bg-blue-600 text-white font-bold py-2 rounded-lg shadow">
                  {sila}
                </div>
                <div className="flex-1 border-t-2 border-gray-300"></div>
              </div>

              {/* Indikator Child */}
              <div className="ml-20 mt-4 space-y-2">
                {indikatorList.map((item, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="w-4 h-4 rounded-full bg-blue-400 mt-1"></div>
                    <p className="text-gray-700 text-sm leading-snug">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
