// Lab meeting update deck (monthly), same visual system as the HPRC talk
const pptxgen = require("pptxgenjs");
const React = require("react"); const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp"); const path = require("path"); const fa = require("react-icons/fa");
const FIG = path.join(__dirname, "..", "figures");
const OUT = path.join(__dirname, "..", "lab_meeting_2026-09.pptx");
const C = { navy: "003C6C", navydeep: "06294A", ink: "18293B", muted: "5B6B7C", gold: "FDC700", amber: "C98A00", teal: "0E7C9C",
  coral: "E4572E", green: "2E7D32", white: "FFFFFF", chip: "F1F4F8", sky: "E7F0F7", hair: "D9E1E9", dim: "9DB0C4", dimdark: "3D5A7A" };
const FONT = "Calibri", W = 13.333, H = 7.5, M = 0.6;
const IMG = { "mapping_page.png": [3160, 1780], "convert_page.png": [3160, 1580], "hgconvert_dropdown.png": [3280, 1820], "lifted_annotations.png": [2415, 548] };
async function icon(name, color, px = 256) { const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: px }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer()).toString("base64"); }
(async () => {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Parsa Eskandar";
  const ic = {}; for (const k of ["FaCheck", "FaCog", "FaExclamationTriangle", "FaCalendarAlt", "FaSearch", "FaRandom", "FaLayerGroup"]) ic[k] = await icon(k, C.white);
  let n = 0; const num = (s, dark) => { n++; s.addText(String(n), { x: W - 1.0, y: H - 0.45, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10, color: dark ? C.dimdark : C.dim, align: "right", isTextBox: true, margin: 0 }); };
  const light = (title, sub) => { const s = pres.addSlide(); s.background = { color: C.white };
    s.addText(title, { x: M, y: 0.42, w: W - 2 * M, h: 0.75, fontFace: FONT, fontSize: 32, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: "middle" });
    if (sub) s.addText(sub, { x: M, y: 1.12, w: W - 2 * M, h: 0.4, fontFace: FONT, fontSize: 15, color: C.muted, isTextBox: true, margin: 0 });
    num(s, false); return s; };
  const card = (s, x, y, w, h, fill = C.chip) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.12 });
  const circleIcon = (s, data, x, y, d, fill = C.navy) => { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } }); const p = d * 0.26; s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p }); };
  const body = (s, text, x, y, w, h, o = {}) => s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 16, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  const bullets = (s, items, x, y, w, h, o = {}) => s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: 7 } })),
    Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 15, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  function browser(s, file, x, y, w) { const [pw, ph] = IMG[file]; const chrome = 0.34, pad = 0.1, iw = w - 2 * pad, ih = iw * ph / pw; const h = chrome + ih + pad;
    card(s, x, y, w, h, C.chip); [["E4572E", 0], ["FDC700", 1], ["2E7D32", 2]].forEach(([col, i]) => s.addShape(pres.shapes.OVAL, { x: x + 0.16 + i * 0.18, y: y + 0.1, w: 0.11, h: 0.11, fill: { color: col }, line: { color: col, width: 0 } }));
    s.addImage({ path: path.join(FIG, file), x: x + pad, y: y + chrome, w: iw, h: ih }); return y + h; }

  // 1. title
  { const s = pres.addSlide(); s.background = { color: C.navydeep }; num(s, true);
    s.addImage({ path: path.join(FIG, "emblem.png"), x: 4.4, y: 1.3, w: 4.5, h: 4.5 * 392 / 1678 });
    s.addText("Pangenome in the Genome Browser", { x: M, y: 2.7, w: W - 2 * M, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: C.white, align: "center", isTextBox: true, margin: 0 });
    s.addText("August update", { x: M, y: 3.6, w: W - 2 * M, h: 0.7, fontFace: FONT, fontSize: 30, color: C.gold, align: "center", isTextBox: true, margin: 0 });
    s.addText("Parsa Eskandar   •   lab meeting, September 2026", { x: M, y: 5.3, w: W - 2 * M, h: 0.5, fontFace: FONT, fontSize: 18, color: C.dim, align: "center", isTextBox: true, margin: 0 });
    s.addNotes("Two-minute framing: the goal is HPRC release 2 usable inside the UCSC Genome Browser: search the graph, translate coordinates between any two assemblies, and carry annotations along. August was the month it became end-to-end real on the dev browser."); }

  // 2. shipped
  { const s = light("Shipped in August: the browser side is end-to-end", "All three pages run on hgwdev against the HPRC v2.0 graph");
    const cw = (W - 2 * M - 0.8) / 3;
    const items = [["mapping_page.png", "Pangenome Mapping", "paste a sequence, all 464 haplotypes ranked by identity, one-click position on any of them"],
      ["convert_page.png", "Convert Coordinates", "any-to-any translation with a scored picker that lists only assemblies containing the region"],
      ["lifted_annotations.png", "Annotations follow you", "QuickLift chains built per request from the graph, plus an Alignment Differences track"]];
    const bottoms = items.map(([f], i) => browser(s, f, M + i * (cw + 0.4), 1.65, cw)); const cy = Math.max(...bottoms) + 0.25;
    items.forEach(([f, t, d], i) => { const x = M + i * (cw + 0.4);
      body(s, t, x, cy, cw, 0.45, { fontSize: 18, bold: true, color: C.navy }); body(s, d, x, cy + 0.5, cw, 1.4, { fontSize: 14, color: C.ink }); });
    body(s, "Also: pangenome assemblies appear in the stock hgConvert menu; core kent changes stayed at 3 files / 15 lines; 385 browser-side tests passing.", M, 6.55, W - 2 * M, 0.5, { fontSize: 14, italic: true, color: C.muted });
    s.addNotes("Walk the three screenshots left to right. Mention the hgConvert integration as the adoption path: nothing new for users to learn."); }

  // 3. under the hood
  { const s = light("Under the hood: four things that changed this month");
    const rows = [["Routing table (Table 2) rebuilt as routing-only", "34M keys, 1.78 GB, 35 min at 32 threads. Zero abandoned runs and zero splits, down from 5.0M and 35.7M. A naive all-pairs table would have been 17.2 TB."],
      ["Per-haplotype identity alongside coverage", "Parses vg's cs:Z string per node; one pass scores all 464 haplotypes. Found and fixed a bug where anchors were estimated proportionally because the parser looked for cg:Z, which vg never emits."],
      ["Concurrency", "Thread-safety audit of FastLocate / tag arrays / trace path, GIL released on read-only bindings, global lock dropped: 6.3 to 60.3 queries/s from 1 to 8 threads (9.6x)."],
      ["Candidate discovery and the scored picker", "Exhaustive discovery took 1 Mb completeness from 2.9% to 93.1% and made it 2x faster; the scored reachables path answers a 100 kb region in 1.28 s instead of 29.5 s."]];
    rows.forEach(([t, d], i) => { const y = 1.5 + i * 1.35; card(s, M, y, W - 2 * M, 1.2, i % 2 ? C.sky : C.chip);
      circleIcon(s, ic.FaCog, M + 0.25, y + 0.28, 0.65); body(s, t, M + 1.15, y + 0.15, W - 2 * M - 1.4, 0.4, { fontSize: 17, bold: true, color: C.navy });
      body(s, d, M + 1.15, y + 0.55, W - 2 * M - 1.4, 0.65, { fontSize: 13.5, color: C.ink }); });
    s.addNotes("Keep this to a minute unless people ask. The routing-table story (17.2 TB to 1.78 GB by dropping stored target intervals) is the one worth telling."); }

  // 4. numbers
  { const s = light("Where the numbers are");
    const common = { fontFace: FONT, catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11, valGridLine: { color: C.hair, size: 0.5 },
      catGridLine: { style: "none" }, showLegend: false, showTitle: true, titleColor: C.navy, titleFontSize: 15, titleFontFace: FONT, dataLabelFontSize: 12, dataLabelColor: C.ink, dataLabelFontFace: FONT };
    s.addChart(pres.charts.BAR, [{ name: "median latency (ms)", labels: ["100 bp", "1 kb", "10 kb", "100 kb", "1 Mb"], values: [22, 21, 115, 599, 4300] }],
      Object.assign({ x: M, y: 1.4, w: 6.1, h: 4.4, barDir: "bar", chartColors: [C.navy], title: "Translation latency, median (ms, log scale)", valAxisLogScaleBase: 10, valAxisMinVal: 10, valAxisMaxVal: 10000,
        showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", catAxisOrientation: "maxMin", barGapWidthPct: 60 }, common));
    s.addChart(pres.charts.LINE, [{ name: "queries / s", labels: ["1", "2", "4", "8", "16", "32"], values: [6.3, 13.2, 23.6, 60.3, 59.4, 65.3] }],
      Object.assign({ x: 7.0, y: 1.4, w: W - M - 7.0, h: 4.4, chartColors: [C.navy], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 8, title: "Concurrent 3.4 kb queries vs threads",
        showValue: true, dataLabelPosition: "t", dataLabelFormatCode: "0", valAxisMinVal: 0, valAxisMaxVal: 80, valAxisMajorUnit: 20 }, common));
    body(s, "Chain generation through the HTTP API is linear at about 1.14 s/Mb (about 250 blocks/Mb). Whole chr10 would be ~150 s; all 466 haplotypes genome-wide ~19 days serialized. That number is why the bulk generator is next.",
      M, 6.05, W - 2 * M, 0.9, { fontSize: 14, color: C.ink });
    s.addNotes("The 19 days figure motivates next month's main item: precomputed chains by direct path intersection, estimated ~300x faster."); }

  // 5. open issues / need input
  { const s = light("Open issues, and where I need input");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, 1.5, cw, 5.2); card(s, M + cw + 0.4, 1.5, cw, 5.2, C.sky);
    circleIcon(s, ic.FaExclamationTriangle, M + 0.3, 1.75, 0.6, C.coral); body(s, "Known issues (mine to fix)", M + 1.05, 1.8, cw - 1.3, 0.5, { fontSize: 18, bold: true, color: C.navy });
    bullets(s, ["Hub temp-file name is derived from the hub path, so a new conversion racing an extend beacon can splice a hub. Needs pid/mkstemp.",
      "extendChain has no server-side payload test; it triggers an ~11 s job.",
      "Trash volume: ~12 files per conversion, one unlink in the whole file.",
      "Wide segdup-dense intervals lose positions (46% recovered on 1q21.1).",
      "Backend nits: two subpath-offset notations, soft-clip identity denominator, warnings[].target rename."], M + 0.3, 2.5, cw - 0.6, 4.1, { fontSize: 13.5 });
    circleIcon(s, ic.FaCheck, M + cw + 0.7, 1.75, 0.6, C.navy); body(s, "Decisions I'd like from the group", M + cw + 1.45, 1.8, cw - 1.3, 0.5, { fontSize: 18, bold: true, color: C.navy });
    bullets(s, ["Sign-off on the one-line hdb.c change (hNibForChrom accepting hub db names). It is committed and widens a hot core path.",
      "Service concurrency: the browser team measured only 13% gain from parallel requests. Likely PANGENOME_COORD_SERIALIZE=1 or a stale liftover_ext.so on pancake. Can I redeploy?",
      "Persistent chain cache: trash sweeps chains after ~1 h, so nothing is shared across users. Ops decision more than code.",
      "Go/no-go on the bulk chain generator (direct path intersection) before the table build finishes.",
      "HPRC 2026: poster is done, and I have a 15-minute talk slot. Feedback on the deck welcome."], M + cw + 0.7, 2.5, cw - 1.0, 4.1, { fontSize: 13.5 });
    s.addNotes("Left column is for transparency; right column is what I actually want out of the meeting. Ask for the hdb.c sign-off and the redeploy explicitly."); }

  // 6. next month
  { const s = light("September plan");
    const items = [["1", "Bulk chain generator", "Direct source/target path intersection, no r-index probing. Estimate ~4 min per chromosome at 32 threads, ~1.6 h genome-wide per target. Benchmark one chromosome pair first."],
      ["2", "Fix the audit items", "Hub write race, extendChain test, trash cleanup, dead chainSpan field, subpath notation."],
      ["3", "Service deployment", "Confirm concurrency in production; persistent chain cache if approved."],
      ["4", "HPRC 2026", "Rehearse the talk; record a 20 s demo of convert -> lifted annotations; print the poster."]];
    const cw = (W - 2 * M - 0.9) / 4;
    items.forEach(([k, t, d], i) => { const x = M + i * (cw + 0.3); card(s, x, 1.6, cw, 4.6);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: 1.9, w: 0.5, h: 0.5, fill: { color: C.gold }, line: { color: C.gold, width: 0 }, rectRadius: 0.08 });
      body(s, k, x + 0.3, 1.9, 0.5, 0.5, { fontSize: 16, bold: true, color: C.navydeep, align: "center", valign: "middle" });
      body(s, t, x + 0.3, 2.6, cw - 0.6, 0.8, { fontSize: 18, bold: true, color: C.navy }); body(s, d, x + 0.3, 3.4, cw - 0.6, 2.6, { fontSize: 13.5, color: C.ink }); });
    body(s, "Stretch: identity over query length (charges soft clips) as an option for the PSL track; single-traversal multi-target translation if the picker commonly asks for many targets.", M, 6.5, W - 2 * M, 0.6, { fontSize: 13, italic: true, color: C.muted });
    s.addNotes("Close by asking who wants to try the dev browser pages and send feedback before the HPRC meeting."); }

  await pres.writeFile({ fileName: OUT }); console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
