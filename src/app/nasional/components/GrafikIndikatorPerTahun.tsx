"use client";
import { FC, useMemo } from "react";
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

interface DataPerIndikator {
  Indikator: string;
  IndikatorNama: string;
  Tahun: number;
  Nilai: number;
  Sila: string;
  Growth?: number; // growth %
}

interface GrafikIndikatorPerTahunProps {
  data: DataPerIndikator[];
  silaColors: Record<string, string>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow text-gray-900 max-w-[250px] whitespace-normal break-words">
        <p className="font-semibold">{d.Indikator}</p>
        <p className="text-xs italic">{d.IndikatorNama}</p>
        <p>{`Tahun: ${d.Tahun}`}</p>
        <p>{`Nilai: ${payload[0].value.toFixed(2)}`}</p>
        {typeof d.Growth === "number" && (
          <p className={`font-medium ${d.Growth >= 0 ? "text-green-600" : "text-red-600"}`}>
            {`Growth: ${d.Growth >= 0 ? "+" : ""}${d.Growth.toFixed(1)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Label growth di atas bar (hijau/merah)
const GrowthLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (typeof value !== "number") return null;
  const color = value >= 0 ? "green" : "red";
  const text = `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill={color}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
    >
      {text}
    </text>
  );
};

const GrafikIndikatorPerTahun: FC<GrafikIndikatorPerTahunProps> = ({ data, silaColors }) => {
  // 1) Hitung growth per Indikator (dibanding tahun sebelumnya utk indikator sama)
  const dataWithGrowth: DataPerIndikator[] = useMemo(() => {
    const grouped: Record<string, DataPerIndikator[]> = {};
    data.forEach((d) => {
      if (!grouped[d.Indikator]) grouped[d.Indikator] = [];
      grouped[d.Indikator].push({ ...d });
    });

    Object.keys(grouped).forEach((key) => {
      const arr = grouped[key].sort((a, b) => a.Tahun - b.Tahun);
      for (let i = 1; i < arr.length; i++) {
        const prev = arr[i - 1];
        const curr = arr[i];
        if (prev.Nilai !== 0) {
          curr.Growth = ((curr.Nilai - prev.Nilai) / prev.Nilai) * 100;
        } else {
          curr.Growth = undefined;
        }
      }
    });
    return Object.values(grouped).flat();
  }, [data]);

  // 2) Sisipkan gap antar indikator (sesuai kode kamu)
  const dataWithGaps: any[] = [];
  let lastIndikator = "";
  dataWithGrowth.forEach((item) => {
    if (lastIndikator && lastIndikator !== item.Indikator) {
      dataWithGaps.push({ Indikator: "", Tahun: "", Sila: "", Growth: undefined });
    }
    dataWithGaps.push(item);
    lastIndikator = item.Indikator;
  });

  // 3) Tambahkan index untuk XAxis kedua (label indikator)
  const dataWithIndex = dataWithGaps.map((d, i) => ({ ...d, index: i }));

  // 4) Hitung tick tengah untuk nama Indikator
  const IndikatorTicks: number[] = [];
  const IndikatorLabels: Record<number, string> = {};
  lastIndikator = "";
  let startIndex = 0;
  dataWithIndex.forEach((item, idx) => {
    if (item.Indikator !== lastIndikator) {
      if (lastIndikator !== "" && startIndex < idx - 1) {
        const mid = Math.floor((startIndex + idx - 1) / 2);
        IndikatorTicks.push(mid);
        IndikatorLabels[mid] = lastIndikator;
      }
      lastIndikator = item.Indikator;
      startIndex = idx;
    }
  });
  if (lastIndikator !== "") {
    const mid = Math.floor((startIndex + dataWithIndex.length - 1) / 2);
    IndikatorTicks.push(mid);
    IndikatorLabels[mid] = lastIndikator;
  }

  // 5) Ringkasan tren dinamis per Indikator (untuk keterangan bernomor)
  const trendSummary = useMemo(() => {
    const tahunList = [...new Set(data.map((d) => d.Tahun))].sort((a, b) => a - b);
    const tahunAwal = tahunList[0];
    const tahunAkhir = tahunList[tahunList.length - 1];
    const prevYear = tahunList.length > 1 ? tahunList[tahunList.length - 2] : undefined;

    const pct = (from?: number, to?: number) => {
      if (from === undefined || to === undefined) return null;
      if (from === 0) return null;
      return ((to - from) / from) * 100;
    };

    const items = Array.from(new Set(data.map((d) => d.Indikator))).map((indikator) => {
      const rows = data
        .filter((d) => d.Indikator === indikator)
        .sort((a, b) => a.Tahun - b.Tahun);

      const first = rows.find((r) => r.Tahun === tahunAwal);
      const last = rows.find((r) => r.Tahun === tahunAkhir);
      const prev = prevYear ? rows.find((r) => r.Tahun === prevYear) : undefined;

      const yoy = pct(prev?.Nilai, last?.Nilai);
      const total = pct(first?.Nilai, last?.Nilai);

      return {
        indikator,
        yoy,
        total,
        arahYoy: yoy === null ? "—" : yoy >= 0 ? "kenaikan" : "penurunan",
        arahTotal: total === null ? "—" : total >= 0 ? "kenaikan" : "penurunan",
      };
    });

    return { tahunAwal, tahunAkhir, prevYear, items };
  }, [data]);

  return (
    <div
      className="p-4 rounded-xl backdrop-blur-sm shadow-lg border border-purple-200"
      style={{ backgroundImage: "url('/bg/bg7.jpg')" }}
    >
      <h3 className="font-semibold text-center text-purple-900 mb-2">
        Tren Indeks per Indikator Sila
      </h3>

      <ResponsiveContainer width="100%" height={230}>
        {/* >>> Tetap gunakan dataWithIndex agar grafik tidak berubah <<< */}
        <BarChart data={dataWithIndex} barCategoryGap="5%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} />

          {/* XAxis 1: Tahun (dekat grafik) */}
          <XAxis
            xAxisId="indeks"
            dataKey="Tahun"
            tick={{ fontSize: 10, fill: "black" }}
            interval={0}
            angle={-20}
            textAnchor="end"
          />

          {/* XAxis 2: Nama Indikator (di bawah) */}
          <XAxis
            xAxisId="indikator"
            dataKey="index"
            orientation="bottom"
            height={20}
            axisLine={false}
            tickLine={false}
            ticks={IndikatorTicks}
            tickFormatter={(value) => IndikatorLabels[value] || ""}
            tick={{ fontSize: 10, fill: "black", dy: 10 }}
          />

          <YAxis tick={{ fontSize: 10, fill: "black" }} />
          <Tooltip content={<CustomTooltip />} />

          {/* Bar pakai data nilai; biarkan binding sumbu sesuai punyamu */}
          <Bar dataKey="Nilai" radius={[6, 6, 0, 0]} xAxisId="tahun">
            {dataWithIndex.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={silaColors[entry.Sila] || "#ccc"} />
            ))}
            <LabelList dataKey="Growth" content={<GrowthLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Keterangan dinamis per indikator — rata kiri (justify) & bernomor */}
      <div className="mt-4 text-xs text-gray-800">
        <ol className="list-decimal list-outside pl-5 space-y-1 text-justify">
          {trendSummary.items.map(({ indikator, yoy, total, arahYoy, arahTotal }) => (
            <li key={indikator}>
              Tren capaian IAP <strong>{indikator}</strong> di tahun {trendSummary.tahunAkhir} menunjukkan {arahYoy} sebesar{" "}
              <span
                className={`font-semibold ${
                  yoy !== null ? (yoy >= 0 ? "text-green-600" : "text-red-600") : ""
                }`}
              >
                {yoy !== null ? Math.abs(yoy).toFixed(2) + "%" : "tidak tersedia"}
              </span>{" "}
              dibandingkan tahun {trendSummary.prevYear}, dan bila dibandingkan dengan tahun {trendSummary.tahunAwal} menunjukkan {arahTotal} sebesar{" "}
              <span
                className={`font-semibold ${
                  total !== null ? (total >= 0 ? "text-green-600" : "text-red-600") : ""
                }`}
              >
                {total !== null ? Math.abs(total).toFixed(2) + "%" : "tidak tersedia"}
              </span>
              .
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default GrafikIndikatorPerTahun;
