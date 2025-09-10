"use client";
import { FC } from "react";

interface FilterTahunProps {
  tahun: number;
  setTahun: (tahun: number) => void;
  daftarTahun: number[];
}

const FilterTahun: FC<FilterTahunProps> = ({ tahun, setTahun, daftarTahun }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <label className="text-sm text-white font-medium">Pilih Tahun:</label>
      <select
        value={tahun}
        onChange={(e) => setTahun(Number(e.target.value))}
        className="px-3 py-1 rounded-lg border border-gray-300 bg-white shadow-sm"
      >
        {daftarTahun.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterTahun;
