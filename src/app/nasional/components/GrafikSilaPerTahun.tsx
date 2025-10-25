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

export interface DataPerSila {
  Sila: string;
  NamaSila: string;
  Tahun: number;
  Nilai: number;
  Growth?: number;
}

interface GrafikSilaPerTahunProps {
  data: DataPerSila[];
  silaColors: Record<string, string>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow text-gray-900">
        <p className="font-semibold">{d.Sila}</p>
        <p>{`Nilai: ${d.Nilai.toFixed(2)}`}</p>
        {d.Growth !== undefined && (
          <p
            className={`font-medium ${
              d.Growth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {`Growth: ${d.Growth >= 0 ? "+" : ""}${d.Growth.toFixed(1)}%`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

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

const GrafikSilaPerTahun: FC<GrafikSilaPerTahunProps> = ({ data, silaColors }) => {
  const dataWithGrowth = useMemo(() => {
    const grouped: Record<string, DataPerSila[]> = {};
    data.forEach((d) => {
      if (!grouped[d.Sila]) grouped[d.Sila] = [];
      grouped[d.Sila].push({ ...d });
    });

    Object.keys(grouped).forEach((sila) => {
      grouped[sila].sort((a, b) => a.Tahun - b.Tahun);
      for (let i = 1; i < grouped[sila].length; i++) {
        const prev = grouped[sila][i - 1];
        const curr = grouped[sila][i];
        if (prev.Nilai !== 0) {
          curr.Growth = ((curr.Nilai - prev.Nilai) / prev.Nilai) * 100;
        } else {
          curr.Growth = undefined;
        }
      }
    });
    return Object.values(grouped).flat();
  }, [data]);

  // === Ringkasan tren pakai "Sila" dan warna dinamis ===
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

    const bySila = new Map<
      string,
      { sila: string; arahYoy: string; yoy: number | null; arahTotal: string; total: number | null }
    >();

    const silaSet = new Set(data.map((d) => d.Sila));
    silaSet.forEach((sila) => {
      const rows = data
        .filter((d) => d.Sila === sila)
        .sort((a, b) => a.Tahun - b.Tahun);

      const first = rows.find((r) => r.Tahun === tahunAwal);
      const last = rows.find((r) => r.Tahun === tahunAkhir);
      const prev = prevYear ? rows.find((r) => r.Tahun === prevYear) : undefined;

      const yoy = pct(prev?.Nilai, last?.Nilai);
      const total = pct(first?.Nilai, last?.Nilai);

      const arahYoy = yoy === null ? "—" : yoy >= 0 ? "kenaikan" : "penurunan";
      const arahTotal = total === null ? "—" : total >= 0 ? "kenaikan" : "penurunan";

      bySila.set(sila, { sila, arahYoy, yoy, arahTotal, total });
    });

    return { tahunAwal, tahunAkhir, prevYear, data: bySila };
  }, [data]);

  return (
    <div
      className="p-4 rounded-xl backdrop-blur-sm shadow-lg border border-purple-200"
      style={{ backgroundImage: "url('/bg/bg7.jpg')" }}
    >
      <h3 className="font-semibold text-center text-purple-900 mb-2">
        Trend Indeks Sila Penyusun IAP
      </h3>

      <ResponsiveContainer width="100%" height={230}>
        <BarChart
          data={dataWithGrowth}
          barCategoryGap="10%"
          margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="Tahun" tick={{ fontSize: 10, fill: "black" }} />
          <YAxis
            tick={{ fontSize: 10, fill: "black" }}
            domain={[0, (dataMax: number) => Math.ceil((dataMax + 5) / 10) * 10]}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Nilai" radius={[6, 6, 0, 0]}>
            {dataWithGrowth.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={silaColors[entry.Sila] || "#8884d8"}
              />
            ))}
            <LabelList dataKey="Growth" content={<GrowthLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Kalimat penjelasan per sila */}
      <div className="mt-2 space-y-1 text-center">
        {Array.from(trendSummary.data.values()).map(
          ({ sila, arahYoy, yoy, arahTotal, total }) => (
            <p key={sila} className="text-xs text-gray-800 italic">
              Tren capaian IAP {sila} di tahun {trendSummary.tahunAkhir} menunjukkan{" "}
              {arahYoy} sebesar{" "}
              <span
                className={`font-semibold ${
                  yoy !== null ? (yoy >= 0 ? "text-green-600" : "text-red-600") : ""
                }`}
              >
                {yoy !== null ? Math.abs(yoy).toFixed(2) + "%" : "tidak tersedia"}
              </span>{" "}
              dibandingkan tahun {trendSummary.prevYear}, dan bila dibandingkan dengan
              tahun {trendSummary.tahunAwal} menunjukkan {arahTotal} sebesar{" "}
              <span
                className={`font-semibold ${
                  total !== null
                    ? total >= 0
                      ? "text-green-600"
                      : "text-red-600"
                    : ""
                }`}
              >
                {total !== null ? Math.abs(total).toFixed(2) + "%" : "tidak tersedia"}
              </span>
              .
            </p>
          )
        )}
      </div>
    </div>
  );
};

export default GrafikSilaPerTahun;
