// FilterSila.tsx
"use client";
import { FC } from "react";

interface FilterSilaProps {
  silaTerpilih: string;
  setSilaTerpilih: (value: string) => void;
  daftarSila: string[];
}

const FilterSila: FC<FilterSilaProps> = ({ silaTerpilih, setSilaTerpilih, daftarSila }) => {
  return (
    <div className="mb-4">
      <label className="mr-2 font-semibold text-black">Pilih Sila</label>
      <select
        value={silaTerpilih}
        onChange={(e) => setSilaTerpilih(e.target.value)}
        className="px-3 py-1 rounded-md border border-gray-300 bg-white text-black"
      >
        {daftarSila.map((sila) => (
          <option key={sila} value={sila}>
            {sila}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterSila;
