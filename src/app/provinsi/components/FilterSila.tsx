"use client";
import React from "react";

interface FilterSilaProps {
  selectedSila: string;
  onChange: (sila: string) => void;
}

const FilterSila: React.FC<FilterSilaProps> = ({ selectedSila, onChange }) => {
  return (
    <div className="flex gap-2 mb-4">
      {[1, 2, 3, 4, 5].map((sila) => (
        <button
          key={sila}
          onClick={() => onChange(String(sila))}
          className={`px-3 py-1 rounded-lg border font-medium ${
            selectedSila === String(sila)
              ? "bg-red-600 text-white"
              : "bg-white text-gray-700 border-gray-300"
          }`}
        >
          Sila {sila}
        </button>
      ))}
    </div>
  );
};

export default FilterSila;
