// Lab meeting deck: mostly full-size screenshots to talk over
const pptxgen = require("pptxgenjs"); const path = require("path");
const FIG = path.join(__dirname, "..", "figures");
const OUT = path.join(__dirname, "..", "lab_meeting_2026-09.pptx");
const C = { navy: "003C6C", navydeep: "06294A", ink: "18293B", muted: "5B6B7C", gold: "FDC700", white: "FFFFFF", chip: "F1F4F8", hair: "D9E1E9", dim: "9DB0C4", dimdark: "3D5A7A" };
const FONT = "Calibri", W = 13.333, H = 7.5, M = 0.5;
const IMG = { "mapping_page.png": [3160, 1780], "pangenome_seq_track.png": [3370, 955], "convert_page.png": [3160, 1580],
  "hgconvert_dropdown.png": [3280, 1820], "lifted_annotations.png": [2415, 548] };
(async () => {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Parsa Eskandar";
  let n = 0; const num = (s, dark) => { n++; s.addText(String(n), { x: W - 0.9, y: H - 0.4, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10, color: dark ? C.dimdark : C.dim, align: "right", isTextBox: true, margin: 0 }); };
  const title = (s, t, sub) => { s.addText(t, { x: M, y: 0.3, w: W - 2 * M, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: "middle" });
    if (sub) s.addText(sub, { x: M, y: 0.95, w: W - 2 * M, h: 0.35, fontFace: FONT, fontSize: 14, color: C.muted, isTextBox: true, margin: 0 }); };
  // one screenshot, as large as fits, in a light browser frame
  function shot(t, file, sub) {
    const s = pres.addSlide(); s.background = { color: C.white }; title(s, t, sub); num(s, false);
    const [pw, ph] = IMG[file], chrome = 0.34, pad = 0.1, top = sub ? 1.45 : 1.15;
    const maxW = W - 2 * M - 2 * pad, maxH = H - top - 0.55 - chrome - pad;
    let iw = maxW, ih = iw * ph / pw; if (ih > maxH) { ih = maxH; iw = ih * pw / ph; }
    const fw = iw + 2 * pad, fh = chrome + ih + pad, x = (W - fw) / 2, y = top;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: fw, h: fh, fill: { color: C.chip }, line: { color: C.chip, width: 0 }, rectRadius: 0.12 });
    [["E4572E", 0], ["FDC700", 1], ["2E7D32", 2]].forEach(([col, i]) => s.addShape(pres.shapes.OVAL, { x: x + 0.16 + i * 0.18, y: y + 0.1, w: 0.11, h: 0.11, fill: { color: col }, line: { color: col, width: 0 } }));
    s.addText("hgwdev-seeskand.gi.ucsc.edu", { x: x + 0.85, y: y + 0.03, w: 4, h: 0.26, fontFace: "Courier New", fontSize: 9, color: C.muted, isTextBox: true, margin: 0, valign: "middle" });
    s.addImage({ path: path.join(FIG, file), x: x + pad, y: y + chrome, w: iw, h: ih });
    return s;
  }

  // 1 title
  { const s = pres.addSlide(); s.background = { color: C.navydeep }; num(s, true);
    s.addImage({ path: path.join(FIG, "emblem.png"), x: 4.4, y: 1.3, w: 4.5, h: 4.5 * 392 / 1678 });
    s.addText("Pangenome in the Genome Browser", { x: M, y: 2.7, w: W - 2 * M, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: C.white, align: "center", isTextBox: true, margin: 0 });
    s.addText("August update", { x: M, y: 3.6, w: W - 2 * M, h: 0.7, fontFace: FONT, fontSize: 30, color: C.gold, align: "center", isTextBox: true, margin: 0 });
    s.addText("Parsa Eskandar", { x: M, y: 5.3, w: W - 2 * M, h: 0.5, fontFace: FONT, fontSize: 18, color: C.dim, align: "center", isTextBox: true, margin: 0 });
    s.addNotes("Goal: HPRC release 2 usable inside the UCSC Genome Browser. August: everything became end-to-end on the dev browser."); }

  // 2-6 screenshots
  shot("Pangenome Mapping: which haplotypes carry my sequence?", "mapping_page.png")
    .addNotes("Mapped once with vg giraffe. All 464 haplotypes scored by identity. Click any haplotype: re-surject, no remapping.");
  shot("The hit lands as a native track", "pangenome_seq_track.png")
    .addNotes("Pangenome Seq track on HG01167 hap1, BLAT-style base-level differences. Just another track.");
  shot("Convert coordinates between any two of 466 assemblies", "convert_page.png")
    .addNotes("CHM13 chr6:32,768,058-32,778,749 to HG02015 paternal, 100% of bases, ~20 ms. Picker can list only assemblies containing the region.");
  shot("Annotations follow you: a QuickLift chain built per request", "lifted_annotations.png")
    .addNotes("HG02015 paternal showing CHM13's CAT/Liftoff genes (HLA-DMA), RefSeq, CenSat, under an Alignment Differences track. Chain built in ~1 s from translation blocks; two-phase widening so panning works.");
  shot("Also inside the stock hgConvert", "hgconvert_dropdown.png")
    .addNotes("Pangenome assemblies in the normal menu; picking one dispatches through the graph. 3 files / 15 lines changed in kent core; 385 tests.");

  // 7 numbers: just the two charts
  { const s = pres.addSlide(); s.background = { color: C.white }; title(s, "Numbers"); num(s, false);
    const common = { fontFace: FONT, catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, catAxisLabelFontSize: 13, valAxisLabelFontSize: 12, valGridLine: { color: C.hair, size: 0.5 },
      catGridLine: { style: "none" }, showLegend: false, showTitle: true, titleColor: C.navy, titleFontSize: 16, titleFontFace: FONT, dataLabelFontSize: 13, dataLabelColor: C.ink, dataLabelFontFace: FONT };
    s.addChart(pres.charts.BAR, [{ name: "median latency (ms)", labels: ["100 bp", "1 kb", "10 kb", "100 kb", "1 Mb"], values: [22, 21, 115, 599, 4300] }],
      Object.assign({ x: M, y: 1.3, w: 6.1, h: 5.4, barDir: "bar", chartColors: [C.navy], title: "Translation latency, median (ms, log scale)", valAxisLogScaleBase: 10, valAxisMinVal: 10, valAxisMaxVal: 10000,
        showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", catAxisOrientation: "maxMin", barGapWidthPct: 60 }, common));
    s.addChart(pres.charts.LINE, [{ name: "queries / s", labels: ["1", "2", "4", "8", "16", "32"], values: [6.3, 13.2, 23.6, 60.3, 59.4, 65.3] }],
      Object.assign({ x: 6.9, y: 1.3, w: W - M - 6.9, h: 5.4, chartColors: [C.navy], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 8, title: "Concurrent 3.4 kb queries / s vs threads",
        showValue: true, dataLabelPosition: "t", dataLabelFormatCode: "0", valAxisMinVal: 0, valAxisMaxVal: 80, valAxisMajorUnit: 20 }, common));
    s.addNotes("~20 ms gene-scale; 0.6 s at 100 kb; 4.3 s at 1 Mb. 9.6x at 8 threads after the GIL release. Routing table: 1.78 GB, 35 min, zero failure modes (naive: 17.2 TB)."); }

  // 8 next
  { const s = pres.addSlide(); s.background = { color: C.white }; title(s, "Next"); num(s, false);
    const items = ["Fix the audit items (hub write race, extendChain test, trash cleanup)",
      "Deploy concurrency on the service; persistent chain cache if we want it",
      "HPRC 2026: poster done, 15-minute talk slot, record a 20 s demo"];
    s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < items.length - 1, paraSpaceAfter: 16 } })),
      { x: M + 0.3, y: 1.5, w: W - 2 * M - 0.6, h: 4.5, fontFace: FONT, fontSize: 24, color: C.ink, isTextBox: true, margin: 0, valign: "top" });
    s.addText("Need: sign-off on the one-line hdb.c change; OK to redeploy the service.", { x: M + 0.3, y: 6.2, w: W - 2 * M - 0.6, h: 0.5, fontFace: FONT, fontSize: 18, italic: true, color: C.navy, isTextBox: true, margin: 0 });
    s.addNotes("Ask explicitly for the hdb.c sign-off and the redeploy."); }

  await pres.writeFile({ fileName: OUT }); console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
