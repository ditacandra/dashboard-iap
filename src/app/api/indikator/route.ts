// app/api/indikator/route.ts
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "data_fixed.xlsx");

    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    const sheet = workbook.Sheets["PER_INDIKATOR"];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    return NextResponse.json(jsonData);
  } catch (error) {
    console.error("Error membaca Excel:", error);
    return NextResponse.json({ error: "Gagal membaca file Excel" }, { status: 500 });
  }
}
