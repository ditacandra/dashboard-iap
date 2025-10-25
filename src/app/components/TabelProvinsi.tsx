"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import React from "react";

interface SilaRow {
  Provinsi: string;
  Tahun: number;
  Nilai: number;
  Sila: string;
}

interface IndikatorRow {
  Provinsi: string;
  Tahun: number;
  Sila: string;
  Indikator: string;
  IndikatorNama: string;
  Nilai: number;
}

export default function TabelProvinsi() {
  const [silaData, setSilaData] = useState<SilaRow[]>([]);
  const [indikatorData, setIndikatorData] = useState<IndikatorRow[]>([]);
  const [tahunList, setTahunList] = useState<number[]>([]);
  const [silaFilter, setSilaFilter] = useState<string>("Sila 1");
  const [provinsiTerpilih, setProvinsiTerpilih] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/data_fixed.xlsx")
      .then((res) => res.arrayBuffer())
      .then((ab) => {
        const workbook = XLSX.read(ab, { type: "array" });

        // Sheet Sila
        const sheetSila = workbook.Sheets["SILA_PROVINSI"];
        if (sheetSila) {
          let json: SilaRow[] = XLSX.utils.sheet_to_json(sheetSila);
          const tahunUnik = Array.from(new Set(json.map((r) => r.Tahun))).sort();
          setTahunList(tahunUnik);
          setSilaData(json);
        }

        // Sheet Indikator
        const sheetIndikator = workbook.Sheets["INDIKATOR_PROVINSI"];
        if (sheetIndikator) {
          let json: IndikatorRow[] = XLSX.utils.sheet_to_json(sheetIndikator);
          setIndikatorData(json);
        }
      });
  }, []);

  const filteredSila = silaData.filter((row) => row.Sila === silaFilter);

  // Group data per provinsi
  const grouped: Record<string, Record<number, number>> = {};
  filteredSila.forEach((row) => {
    if (!grouped[row.Provinsi]) grouped[row.Provinsi] = {};
    grouped[row.Provinsi][row.Tahun] = row.Nilai;
  });

  return (
    <div className="my-12 px-6 pt-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-white text-center underline decoration-4 decoration-white underline-offset-4 drop-shadow-sm">
        Tabel Data Provinsi per Sila dan Indikator
      </h2>

      {/* Filter Dropdown → di luar kotak putih */}
      <div className="mb-4 flex gap-2 items-center">
        <span className="font-semibold text-white ">Filter Sila:</span>
        <select
          className="border rounded px-2 py-1 bg-white text-black"
          value={silaFilter}
          onChange={(e) => {
            setSilaFilter(e.target.value);
            setProvinsiTerpilih(null); // reset kalau ganti sila
          }}
        >
          <option value="Sila 1">Sila 1</option>
          <option value="Sila 2">Sila 2</option>
          <option value="Sila 3">Sila 3</option>
          <option value="Sila 4">Sila 4</option>
          <option value="Sila 5">Sila 5</option>
          <option value="IAP">IAP</option>
        </select>
      </div>

      {/* Kotak putih hanya untuk tabel */}
      <div className="p-6 bg-white rounded-xl shadow-lg overflow-x-auto pb-6">
        <div className="max-h-[600px] overflow-y-auto border rounded-lg">
          <table className="min-w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <tr>
                <th className="border px-3 py-2 w-[300px]">Provinsi</th>
                {tahunList.map((tahun) => (
                  <th key={`n${tahun}`} className="border px-3 py-2 w-[70px]">
                    {tahun}
                  </th>
                ))}
                {tahunList.slice(1).map((tahun, i) => (
                  <th
                    key={`d${tahun}`}
                    className="border px-3 py-2 w-[70px] bg-amber-600/80"
                  >
                    <div className="whitespace-pre-wrap text-xs text-white text-center">
                      Growth {tahun} ke {tahunList[i]}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {Object.keys(grouped).map((provinsi, idx) => {
                const isExpanded = provinsiTerpilih === provinsi;

                return (
                  <React.Fragment key={provinsi}>
                    {/* Baris provinsi */}
                    <tr
                      className={`${
                        silaFilter === "IAP"
                          ? "" // kalau IAP, disable klik
                          : "cursor-pointer hover:bg-yellow-100"
                      } ${idx % 2 === 0 ? "bg-blue-50" : "bg-blue-100"} ${
                        isExpanded ? "border-4 border-blue-400 border-b-0" : ""
                      }`}
                      onClick={() => {
                        if (silaFilter !== "IAP") {
                          setProvinsiTerpilih(isExpanded ? null : provinsi);
                        }
                      }}
                    >
                      <td className="px-3 py-2 font-semibold w-[300px]">
                        {provinsi}
                      </td>
                      {tahunList.map((tahun) => (
                        <td
                          key={`n${provinsi}-${tahun}`}
                          className="px-3 py-2 text-center w-[70px]"
                        >
                          {grouped[provinsi][tahun] != null
                            ? grouped[provinsi][tahun].toFixed(2)
                            : "-"}
                        </td>
                      ))}
                      {tahunList.slice(1).map((tahun, i) => {
                        const prevTahun = tahunList[i];
                        const nilai = grouped[provinsi][tahun];
                        const prevNilai = grouped[provinsi][prevTahun];
                        let delta: number | null = null;
                        if (nilai != null && prevNilai != null) {
                          delta = nilai - prevNilai;
                        }
                        return (
                          <td
                            key={`d${provinsi}-${tahun}`}
                            className={`px-3 py-2 text-center font-semibold w-[70px] ${
                              delta != null
                                ? delta > 0
                                  ? "bg-green-100 text-green-800"
                                  : delta < 0
                                  ? "bg-red-100 text-red-800"
                                  : "bg-amber-50 text-amber-800"
                                : "bg-amber-50"
                            }`}
                          >
                            {delta === null ? "-" : delta.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Baris indikator expand */}
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={
                            1 + tahunList.length + (tahunList.length - 1)
                          }
                          className="p-0 border-4 border-blue-400 border-t-0"
                        >
                          <table className="min-w-full table-fixed text-sm italic">
                            <thead>
                              <tr className="bg-sky-300">
                                <th className="border px-3 py-1 text-right w-[300px]">
                                  Indikator
                                </th>
                                {tahunList.map((tahun) => (
                                  <th
                                    key={`i-n${tahun}`}
                                    className="border px-3 py-1 text-center w-[70px]"
                                  ></th>
                                ))}
                                {tahunList.slice(1).map((tahun, i) => (
                                  <th
                                    key={`i-d${tahun}`}
                                    className="border px-3 py-1 text-center w-[70px]"
                                  ></th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const indikatorProv = indikatorData.filter(
                                  (row) =>
                                    row.Provinsi === provinsi &&
                                    row.Sila === silaFilter
                                );

                                const groupedIndikator: Record<
                                  string,
                                  Record<number, number>
                                > = {};
                                indikatorProv.forEach((row) => {
                                  const namaGabungan =
                                    row.Indikator +
                                    " - " +
                                    row.IndikatorNama;
                                  if (!groupedIndikator[namaGabungan])
                                    groupedIndikator[namaGabungan] = {};
                                  groupedIndikator[namaGabungan][row.Tahun] =
                                    row.Nilai;
                                });

                                return Object.keys(groupedIndikator).map(
                                  (indik, i) => (
                                    <tr
                                      key={indik}
                                      className={`${
                                        i % 2 === 0
                                          ? "bg-sky-50"
                                          : "bg-sky-100"
                                      }`}
                                    >
                                      <td className="border px-3 py-1 text-right font-medium w-[300px]">
                                        {indik}
                                      </td>
                                      {tahunList.map((tahun) => (
                                        <td
                                          key={`val-${indik}-${tahun}`}
                                          className="border px-3 py-1 text-center w-[70px]"
                                        >
                                          {groupedIndikator[indik][tahun] !=
                                          null
                                            ? groupedIndikator[indik][
                                                tahun
                                              ].toFixed(2)
                                            : "-"}
                                        </td>
                                      ))}
                                      {tahunList.slice(1).map((tahun, j) => {
                                        const prevTahun = tahunList[j];
                                        const nilai =
                                          groupedIndikator[indik][tahun];
                                        const prevNilai =
                                          groupedIndikator[indik][prevTahun];
                                        let delta: number | null = null;
                                        if (
                                          nilai != null &&
                                          prevNilai != null
                                        ) {
                                          delta = nilai - prevNilai;
                                        }
                                        return (
                                          <td
                                            key={`delta-${indik}-${tahun}`}
                                            className={`border px-3 py-1 text-center font-semibold w-[70px] ${
                                              delta != null
                                                ? delta > 0
                                                  ? "bg-green-100 text-green-800"
                                                  : delta < 0
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-amber-50 text-amber-800"
                                                : "bg-amber-50"
                                            }`}
                                          >
                                            {delta === null
                                              ? "-"
                                              : delta.toFixed(2)}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  )
                                );
                              })()}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
