"use client";
import { useEffect, useState, useMemo } from "react";
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

      // hitung growth antar tahun per indikator (persen) — tetap untuk label di atas batang
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

  // === Ringkasan per indikator (bullet) menggunakan selisih poin, bukan persen ===
  const bulletSummary = useMemo(() => {
    if (!dataWithIndex.length) return null;

    // Ambil semua tahun yang ada di data (non-gap & punya nilai)
    const rows = dataWithIndex.filter(
      (d) => !d._isGap && d.Nilai !== null && d.Nilai !== undefined
    ) as Required<Pick<DataIndikatorProvinsi, "Indikator" | "Tahun" | "Nilai">>[];

    if (!rows.length) return null;

    const years = Array.from(new Set(rows.map((r) => Number(r.Tahun)))).sort(
      (a, b) => a - b
    );
    const lastYear = years[years.length - 1];
    const prevYear = years.length > 1 ? years[years.length - 2] : null;
    const baseYear = 2021;

    // Kelompokkan per indikator
    const map: Record<
      string,
      { byYear: Record<number, number>; name: string }
    > = {};

    rows.forEach((r) => {
      if (!map[r.Indikator]) {
        map[r.Indikator] = { byYear: {}, name: r.Indikator };
      }
      map[r.Indikator].byYear[Number(r.Tahun)] = Number(r.Nilai);
    });

    const items = Object.values(map).map((g) => {
      const lastVal = g.byYear[lastYear];
      const prevVal = prevYear ? g.byYear[prevYear] : undefined;
      const baseVal = g.byYear[baseYear];

      const yoyDiff =
        prevVal !== undefined && lastVal !== undefined
          ? +(lastVal - prevVal).toFixed(2)
          : null;
      const vs2021Diff =
        baseVal !== undefined && lastVal !== undefined
          ? +(lastVal - baseVal).toFixed(2)
          : null;

      const arah = (v: number | null) =>
        v === null ? "—" : v >= 0 ? "kenaikan" : "penurunan";

      return {
        indikator: g.name,
        lastYear,
        prevYear,
        baseYear,
        yoyDiff,
        vs2021Diff,
        arahYoY: arah(yoyDiff),
        arah2021: arah(vs2021Diff),
      };
    });

    // Urutkan alfabetis biar rapi (opsional)
    items.sort((a, b) => a.indikator.localeCompare(b.indikator));

    return { items, lastYear, prevYear, baseYear };
  }, [dataWithIndex]);

  return (
    <div className="w-full p-4 bg-blue-50 rounded-xl">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        Tren Indikator – Sila {sila} – {namaProvinsi}
      </h2>

      {/* 🔥 Tambahan: wrapper scroll horizontal di HP */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
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

              {/* X Axis Tahun */}
              <XAxis
                dataKey="Tahun"
                xAxisId="indeks"
                interval={0}
                angle={-20}
                textAnchor="end"
                tick={{ fontSize: 10, fill: "black" }}
                tickLine={false}
              />

              {/* X Axis Indikator */}
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

              {/* Bar */}
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
                <LabelList dataKey="Growth" content={<CustomGrowthLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📝 Keterangan per indikator (bullet), di bagian paling bawah */}
      {bulletSummary && (
        <div className="mt-4 text-xs sm:text-sm text-gray-800">
          <ol className="list-decimal list-outside pl-5 space-y-1 text-justify">
            {bulletSummary.items.map(
              ({
                indikator,
                yoyDiff,
                vs2021Diff,
                arahYoY,
                arah2021,
              }) => (
                <li key={indikator}>
                  Indikator <strong>{indikator}</strong> di tahun{" "}
                  {bulletSummary.lastYear} menunjukkan {arahYoY}{" "}
                  <span
                    className={`font-semibold ${
                      yoyDiff !== null
                        ? yoyDiff >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        : ""
                    }`}
                  >
                    {yoyDiff !== null
                      ? Math.abs(yoyDiff).toFixed(2)
                      : "tidak tersedia"}
                  </span>{" "}
                  poin dibandingkan tahun {bulletSummary.prevYear ?? "—"}, dan
                  bila dibandingkan tahun {bulletSummary.baseYear} menunjukkan{" "}
                  {arah2021}{" "}
                  <span
                    className={`font-semibold ${
                      vs2021Diff !== null
                        ? vs2021Diff >= 0
                          ? "text-green-600"
                          : "text-red-600"
                        : ""
                    }`}
                  >
                    {vs2021Diff !== null
                      ? Math.abs(vs2021Diff).toFixed(2)
                      : "tidak tersedia"}
                  </span>{" "}
                  poin.
                </li>
              )
            )}
          </ol>
        </div>
      )}
    </div>
  );
};

export default GrafikIndikatorProvinsi;
