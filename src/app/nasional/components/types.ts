// app/components/types.ts

export interface DataPerSila {
  Sila: string;
  NamaSila: string;
  Tahun: number;
  Nilai: number;
  Delta?: number;
}

export interface DataPerIndikator {
  Sila: string;
  NamaSila: string;
  Indikator: string;
  IndikatorNama: string;
  Tahun: number;
  Nilai: number;
}
