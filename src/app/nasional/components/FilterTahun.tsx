"use client";
import { FC } from "react";

interface FilterTahunProps {
  tahunTerpilih: number;
  setTahunTerpilih: (tahun: number) => void;
  daftarTahun: number[];
}

const FilterTahun: FC<FilterTahunProps> = ({ tahunTerpilih, setTahunTerpilih, daftarTahun }) => {
  return (
    <div className="mb-4">
      <label className="mr-2 font-semibold text-black">Pilih Tahun:</label>
      <select
        value={tahunTerpilih}
        onChange={(e) => setTahunTerpilih(Number(e.target.value))}
        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-black"
      >
        {daftarTahun.map((tahun) => (
          <option key={tahun} value={tahun}>
            {tahun}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterTahun;
