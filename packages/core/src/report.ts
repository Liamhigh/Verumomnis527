import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function buildReportPDF(input:{
  caseName: string;
  jurisdiction: { tz:string; offset:number; lat?:number; lon?:number; method:string };
  manifest: { name:string; sha512:string; size:number; type:string }[];
  qv: any; // from runOfflineQV or cloud result
  logoPng?: Uint8Array; // optional
}) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([595, 842]);
  const draw = (text:string, x:number, y:number, size=11)=> {
    page.drawText(text, { x, y, size, font, color: rgb(0,0,0) });
  };

  // Header
  let y = 800;
  draw("VERUM OMNIS — OFFLINE FORENSIC REPORT", 50, y, 16); y -= 20;
  draw(`Case: ${input.caseName}`, 50, y); y -= 14;
  draw(`Jurisdiction: tz=${input.jurisdiction.tz}, offset=${input.jurisdiction.offset}m, method=${input.jurisdiction.method}`, 50, y); y -= 20;

  // Manifest
  draw("Evidence Manifest (SHA-512):", 50, y); y -= 14;
  for (const m of input.manifest.slice(0, 12)) { // cap lines for page 1
    draw(`• ${m.name} — ${m.sha512.slice(0,16)}… (${m.size} bytes)`, 60, y); y -= 12;
    if (y < 80) break;
  }

  // Consensus
  y -= 10; draw("Quadruple Verification (offline rules):", 50, y); y -= 14;
  draw(`Majority clusters: ${input.qv.summary.majority.length} | Conflicts: ${input.qv.summary.conflicts.length}`, 60, y); y -= 14;

  // Footer
  const ts = new Date().toISOString();
  draw(`Sealed: ${ts} | Patent Pending Verum Omnis © 2025`, 50, 40);

  return await pdf.save();
}
