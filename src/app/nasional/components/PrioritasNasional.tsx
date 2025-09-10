"use client";

import {
  BookOpen,
  Users,
  Shield,
  Landmark,
  Globe,
  Heart,
  Briefcase,
  GraduationCap,
  ArrowDown,
} from "lucide-react";

const pnList = [
  { id: 1, title: "PN 1", subtitle: "SDM Berkualitas dan Berdaya Saing", icon: GraduationCap },
  { id: 2, title: "PN 2", subtitle: "Revolusi Mental dan Pembangunan Kebudayaan", icon: BookOpen },
  { id: 3, title: "PN 3", subtitle: "Infrastruktur Merata dan Berkeadilan", icon: Landmark },
  { id: 4, title: "PN 4", subtitle: "Lingkungan Hidup, Ketahanan Bencana, dan Perubahan Iklim", icon: Globe },
  { id: 5, title: "PN 5", subtitle: "Ketahanan Ekonomi untuk Pertumbuhan Berkualitas", icon: Briefcase },
  { id: 6, title: "PN 6", subtitle: "Pemerataan Pembangunan", icon: Users },
  { id: 7, title: "PN 7", subtitle: "Stabilitas Polhukhankam dan Transformasi Pelayanan Publik", icon: Shield },
  { id: 8, title: "PN 8", subtitle: "Memperkuat Ketahanan Nasional dan Tata Kelola Pemerintahan", icon: Heart },
];

function PrioritasNasional() {
  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Judul Atas */}
      <h2 className="text-2xl mt-8 font-semibold text-red-800 text-center">
        PERATURAN PRESIDEN NO. 12/2025 TENTANG RPJMN 2025-2029
      </h2>
       <div className="mt-1 text-lg font-semibold text-gray-700 text-center">
        <p>
          PRIORITAS NASIONAL
        </p>
        </div>
      {/* Kotak PN 1 - 8 */}
      <div className="flex flex-wrap justify-center gap-6">
        {pnList.map((pn) => {
          const Icon = pn.icon;
          return (
            <div
              key={pn.id}
              className="flex flex-col items-center p-4 w-52 h-36  backdrop-blur-sm rounded-2xl shadow-md border border-gray-200"
            style={{ backgroundImage: "url('/bg/bg8.jpg')" }}>
              <Icon className="w-8 h-8 mb-2 text-indigo-600" />
              <h3 className="font-bold text-lg text-gray-800">{pn.title}</h3>
              <p className="text-sm text-center text-gray-700">{pn.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Panah ke bawah */}
      <ArrowDown className="w-10 h-10 text-gray-600 animate-bounce" />

      {/* Kotak Program Prioritas */}
      <div className="p-6 bg-indigo-100 rounded-2xl shadow-md w-full max-w-3xl text-center">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">Program Prioritas 1</h3>
        <p className="text-base text-gray-800">
          Penguatan Ideologi Pancasila, Wawasan Kebangsaan, dan Ketahanan Nasional
        </p>
      </div>

      {/* Panah ke bawah */}
      <ArrowDown className="w-10 h-10 text-gray-600 animate-bounce" />

      {/* Kotak Indikator */}
      <div className="p-6 bg-green-100 rounded-2xl shadow-md w-full max-w-2xl text-center">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">Indikator</h3>
        <p className="text-base text-gray-800">Indeks Aktualisasi Pancasila</p>
      </div>
    </div>
  );
}

export default PrioritasNasional;
