// HPRC 2026 talk deck generator (pptxgenjs) — v3: challenge, tag arrays, two recorded scenarios
const pptxgen = require("pptxgenjs"); const path = require("path"); const fs = require("fs");
const FIG = path.join(__dirname, "..", "figures"); const OUT = path.join(__dirname, "..", "HPRC2026_talk.pptx");
const VID = path.join(FIG, "videos");

const C = { navy: "003C6C", navydeep: "06294A", ink: "18293B", muted: "5B6B7C", gold: "FDC700", teal: "0E7C9C", coral: "E4572E",
  white: "FFFFFF", card: "F3F5F8", cardLine: "E1E6EC", hair: "D9E1E9", dim: "C6D3DF", dimdark: "3D5A7A", grid: "17436B", stem: "B8C7D6", dots: "CBD5E0" };
const FONT = "Calibri", W = 13.333, H = 7.5, M = 0.7, T = 1.5;
const IMG = { "crop_mapping_result.png": [2060, 675], "crop_seqtrack.png": [1650, 430], "crop_convert.png": [2200, 1578], "crop_dropdown.png": [1800, 850],
  "crop_lifted.png": [1750, 547], "translation.png": [2691, 1715], "emblem.png": [1678, 392], "emblem2.png": [1678, 392], "hprc_logo.png": [1855, 1540],
  "grids.png": [2783, 982], "own/tag2_0.png": [1930, 1284], "own/tag4_0.png": [1032, 402] };

(async () => {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Parsa Eskandar";
  pres.title = "A pangenome sequence search and coordinate translation service for the UCSC Genome Browser";
  let n = 0;
  const num = (s, dark) => { n++; s.addText(String(n), { x: W - M - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10, color: dark ? C.dimdark : C.hair, align: "right", isTextBox: true, margin: 0 }); };
  const notes = (s, t) => s.addNotes(t.trim());
  const txt = (s, text, x, y, w, h, o = {}) => s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 18, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  const bullets = (s, items, x, y, w, h, o = {}) => s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1, paraSpaceAfter: 10 } })),
    Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 18, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  const light = (title, tag) => { const s = pres.addSlide(); s.background = { color: C.white };
    txt(s, title, M, 0.5, W - 2 * M - 2.4, 0.8, { fontSize: 30, bold: true, color: C.navy, valign: "middle" });
    if (tag) txt(s, tag, W - M - 2.3, 0.5, 2.3, 0.8, { fontSize: 14, bold: true, color: C.muted, align: "right", valign: "middle", charSpacing: 2 });
    num(s, false); return s; };
  const dark = () => { const s = pres.addSlide(); s.background = { color: C.navydeep }; num(s, true); return s; };
  const rule = (s, y, dark) => s.addShape(pres.shapes.LINE, { x: M, y, w: W - 2 * M, h: 0, line: { color: dark ? C.dimdark : C.hair, width: 1 } });
  const soft = (s, x, y, w, h) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.card }, line: { color: C.cardLine, width: 1 }, rectRadius: 0.1 });
  const takeaway = (s, text, y = 6.45) => txt(s, text, M, y, W - 2 * M, 0.6, { fontSize: 20, italic: true, color: C.navy, align: "center", valign: "middle" });
  const img = (s, file, x, y, w, maxH) => { const [pw, ph] = IMG[file]; let iw = w, ih = w * ph / pw; if (maxH && ih > maxH) { ih = maxH; iw = ih * pw / ph; }
    s.addImage({ path: path.join(FIG, file), x: x + (w - iw) / 2, y, w: iw, h: ih }); return y + ih; };
  // light browser frame around a screenshot
  function frame(s, file, x, y, w, maxH) {
    const [pw, ph] = IMG[file]; const chrome = 0.32, pad = 0.1; let iw = w - 2 * pad, ih = iw * ph / pw;
    if (maxH && ih > maxH - chrome - pad) { ih = maxH - chrome - pad; iw = ih * pw / ph; }
    const fw = iw + 2 * pad, fx = x + (w - fw) / 2, fh = chrome + ih + pad;
    soft(s, fx, y, fw, fh);
    for (let i = 0; i < 3; i++) s.addShape(pres.shapes.OVAL, { x: fx + 0.15 + i * 0.17, y: y + 0.1, w: 0.1, h: 0.1, fill: { color: C.dots }, line: { color: C.dots, width: 0 } });
    s.addImage({ path: path.join(FIG, file), x: fx + pad, y: y + chrome, w: iw, h: ih });
    return { bottom: y + fh, x: fx, w: fw };
  }
  // video slot: embeds figures/videos/<name>.mp4 if present, otherwise a clean placeholder
  function video(s, name, x, y, w, h, label) {
    const p = path.join(VID, name);
    if (fs.existsSync(p)) { s.addMedia({ type: "video", path: p, x, y, w, h }); return true; }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.navydeep }, line: { color: C.navydeep, width: 0 }, rectRadius: 0.1 });
    s.addShape(pres.shapes.OVAL, { x: x + w / 2 - 0.5, y: y + h / 2 - 0.5, w: 1.0, h: 1.0, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: x + w / 2 - 0.17, y: y + h / 2 - 0.22, w: 0.42, h: 0.44, rotate: 90, fill: { color: C.navydeep }, line: { color: C.navydeep, width: 0 } });
    txt(s, label, x, y + h - 0.9, w, 0.4, { fontSize: 16, color: C.dim, align: "center" });
    txt(s, "drop " + name + " into talk/figures/videos and rebuild, or Insert > Video here", x, y + h - 0.5, w, 0.35, { fontSize: 11, color: C.dimdark, align: "center" });
    return false;
  }

  // ================= 1. TITLE =================
  { const s = dark();
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.55, w: W, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    s.addImage({ path: path.join(FIG, "emblem.png"), x: W - M - 5.5, y: 2.565 - 5.5 * 392 / 1678 / 2, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: M, y: 0.5, w: 1.3, h: 1.3 * 1540 / 1855 });
    txt(s, "HPRC 2026", M, 2.05, 4, 0.35, { fontSize: 14, bold: true, color: C.gold, charSpacing: 3 });
    s.addText([{ text: "The UCSC Genome Browser", options: { breakLine: true } }, { text: "now speaks pangenome.", options: { color: C.gold } }],
      { x: M, y: 2.85, w: 9.5, h: 1.7, fontFace: FONT, fontSize: 44, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "top" });
    txt(s, "Sequence search and rapid lift-over across all 464 HPRC haplotypes", M, 4.65, 11, 0.5, { fontSize: 20, color: C.white });
    txt(s, "Live on the development browser today", M, 5.2, 9.5, 0.4, { fontSize: 16, color: C.dim });
    txt(s, "Parsa Eskandar   •   Jouni Sirén   •   Benedict Paten", M, 6.05, 10, 0.45, { fontSize: 18, color: C.white });
    txt(s, "UC Santa Cruz Genomics Institute", M, 6.5, 10, 0.4, { fontSize: 16, color: C.dim });
    notes(s, `[0:00-0:15]
Thanks. I'm Parsa Eskandar, from Benedict Paten's lab at UC Santa Cruz, and this is joint work with Jouni Sirén and the UCSC Genome Browser team.`); }

  // ================= 2. COLD OPEN =================
  { const s = dark();
    txt(s, "464", M, 0.85, 5.6, 2.0, { fontSize: 120, bold: true, color: C.gold, valign: "middle" });
    txt(s, "haplotype assemblies the Genome Browser can open", M, 2.85, 5.6, 0.9, { fontSize: 22, color: C.white });
    txt(s, "56", 7.0, 0.85, 5.7, 2.0, { fontSize: 120, bold: true, color: C.white, valign: "middle" });
    txt(s, "chain files in its database", 7.0, 2.85, 5.7, 0.9, { fontSize: 22, color: C.dim });
    const cols = 29, rows = 16, sq = 0.115, pitch = 0.16, gx = M, gy = 4.0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const g = (r === 6 && c === 9) || (r === 9 && c === 18); const col = g ? C.gold : C.grid;
      s.addShape(pres.shapes.RECTANGLE, { x: gx + c * pitch, y: gy + r * pitch, w: sq, h: sq, fill: { color: col }, line: { color: col, width: 0 } }); }
    txt(s, "464 coordinate systems; two of them hold almost everything we know", M, 6.7, 5.9, 0.5, { fontSize: 15, color: C.dim });
    txt(s, "Almost everything we know about the human genome is written in hg38 or CHM13.", 7.0, 4.1, 5.7, 1.4, { fontSize: 22, color: C.white });
    txt(s, "You can look at the other 462. You can't ask them anything.", 7.0, 5.6, 5.7, 1.0, { fontSize: 22, italic: true, color: C.gold });
    notes(s, `[0:15-1:00]
HPRC release 2 is a remarkable resource, and the Genome Browser can open all 464 haplotype assemblies. The same database has 56 chain files.
(pause)
Which means almost everything we know about the human genome, written in hg38 or CHM13, cannot move onto the other 462. You can look at them. You can't ask them anything. That is the problem this talk is about.`); }

  // ================= 3. THE CHALLENGE =================
  { const s = light("Why release 2 is hard to use in the browser");
    const cw = (W - 2 * M - 0.8) / 3;
    const items = [["Knowledge lives on two references", "ClinVar, GWAS, ENCODE, RefSeq, your own tracks: written once, in hg38 or CHM13 coordinates. Release 2 gives each haplotype CAT and Liftoff genes, and nothing else follows."],
      ["Sequence search is single-assembly", "BLAT runs against one assembly at a time and knows nothing about the graph. It cannot tell you which haplotypes carry a sequence."],
      ["Lift-over needs a chain per pair", "QuickLift draws one assembly's tracks on another, but only over a prebuilt chain. 464 haplotypes: more than 200,000 pairs. Chains: 56."]];
    items.forEach(([a, b], i) => { const x = M + i * (cw + 0.4);
      txt(s, String(i + 1).padStart(2, "0"), x, T + 0.1, cw, 0.5, { fontSize: 16, bold: true, color: C.gold, charSpacing: 2 });
      txt(s, a, x, T + 0.55, cw, 1.0, { fontSize: 22, bold: true, color: C.navy });
      s.addShape(pres.shapes.LINE, { x, y: T + 1.65, w: cw, h: 0, line: { color: C.hair, width: 1 } });
      txt(s, b, x, T + 1.85, cw, 2.8, { fontSize: 17 }); });
    takeaway(s, "The graph is the alignment of all 464 at once. In the browser, it has been a file, not a tool.");
    notes(s, `[1:00-2:00]
Three reasons, and this room knows all three.
First, our knowledge lives on two references. ClinVar, GWAS, ENCODE, RefSeq, your own BED file: written once, in hg38 or CHM13 coordinates. Release 2 gives each haplotype CAT and Liftoff genes, and that's where it stops.
Second, sequence search is single-assembly. BLAT runs against one assembly and knows nothing about the graph. It cannot tell you which haplotypes carry your sequence, or how common it is.
Third, lift-over needs a chain per pair. QuickLift, shipped last year, is a great tool: it draws one assembly's tracks on another. But only over a prebuilt chain, made on request. 464 haplotypes is more than two hundred thousand pairs. The browser has fifty-six.
The graph is, by construction, the alignment of all 464 at once. In the browser, it has been a file, not a tool.`); }

  // ================= 4. TWO AFTERNOONS =================
  const U = [["Scenario 1", "A sequence GRCh38 doesn't have", "A researcher assembles an insertion from a patient's long reads. It isn't in the reference. Which HPRC haplotypes carry it, and what does it look like there?", "BLAT: one assembly at a time, blind to the graph"],
    ["Scenario 2", "A gene you know, on a genome you don't", "The same researcher is curating a gene on GRCh38, ClinVar and GWAS open, and wants to see it on one HPRC individual.", "QuickLift: only where a chain already exists"]];
  const cw2 = (W - 2 * M - 0.6) / 2;
  { const s = light("One researcher, two afternoons");
    U.forEach(([tag, a, b, today], k) => { const x = M + k * (cw2 + 0.6);
      txt(s, tag, x, T + 0.1, cw2, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
      txt(s, a, x, T + 0.5, cw2, 0.6, { fontSize: 24, bold: true, color: C.navy });
      s.addShape(pres.shapes.LINE, { x, y: T + 1.25, w: cw2, h: 0, line: { color: C.hair, width: 1 } });
      txt(s, b, x, T + 1.45, cw2, 1.6, { fontSize: 19 });
      txt(s, "today", x, T + 3.2, cw2, 0.35, { fontSize: 15, color: C.muted });
      txt(s, today, x, T + 3.55, cw2, 0.8, { fontSize: 22, bold: true, color: C.coral }); });
    takeaway(s, "By the end of this talk: both afternoons, in the browser, in seconds.");
    notes(s, `[2:00-2:45]
Let me make this concrete with one researcher and two afternoons.
First afternoon: she has assembled an insertion from a patient's long reads, and it is not in GRCh38. Which HPRC haplotypes carry it? How common is it? What does the neighbourhood look like on a genome that actually has it? Today her tool is BLAT, one assembly at a time, and it can't tell her who else carries the sequence.
Second afternoon: she's curating a gene on GRCh38, ClinVar and the GWAS catalog open, and she wants that locus on one HPRC individual. Today her tool is QuickLift, and it works only where a chain already exists.
By the end of this talk: both afternoons, in the browser, in seconds.`); }

  // ================= 5. WHAT WE BUILT =================
  { const s = light("One index over the graph, two tools in the browser");
    const bx = M, by = T + 0.3, bw = W - 2 * M;
    soft(s, bx, by, bw, 1.3);
    txt(s, "Tag-array index over the HPRC v2.0 graph", bx, by + 0.15, bw, 0.5, { fontSize: 22, bold: true, color: C.navy, align: "center" });
    txt(s, "464 haplotypes  •  every BWT position knows its graph position  •  every node knows every haplotype crossing it", bx, by + 0.7, bw, 0.4, { fontSize: 16, color: C.muted, align: "center" });
    [[M, "Pangenome Mapping", "Paste a sequence. Every haplotype that carries it, ranked; land on any of them as a track.", "Scenario 1"],
     [M + cw2 + 0.6, "Rapid lift-over", "Pick any of 464 haplotypes. A chain is built on the spot and the reference's tracks follow.", "Scenario 2"]].forEach(([x, a, b, tag]) => {
      s.addShape(pres.shapes.LINE, { x: x + cw2 / 2, y: by + 1.3, w: 0, h: 0.55, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
      txt(s, tag, x, by + 2.0, cw2, 0.35, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
      txt(s, a, x, by + 2.35, cw2, 0.55, { fontSize: 24, bold: true, color: C.navy });
      txt(s, b, x, by + 2.95, cw2, 1.2, { fontSize: 18 }); });
    txt(s, "Both run as one service behind the browser; 15 lines changed in the browser's core.", M, 6.5, W - 2 * M, 0.5, { fontSize: 15, italic: true, color: C.muted, align: "center" });
    notes(s, `[2:45-3:20]
Here is what we built, in one picture. One index over the HPRC v2.0 graph: the tag-array index, which I'll explain in a moment. Every position in the BWT knows its graph position, and every node knows every haplotype crossing it.
Two tools sit on top of it in the browser. Pangenome Mapping: paste a sequence, get every haplotype that carries it, land on any of them as a track. Rapid lift-over: pick any of the 464 haplotypes, a chain is built on the spot, and the reference's tracks follow you.
Both run as one service behind the browser. The browser itself changed by fifteen lines.`); }

  // ================= 6. TAG ARRAYS: THE DILEMMA =================
  { const s = light("Indexing a pangenome forced a trade-off", "Tag arrays");
    const cw = (W - 2 * M - 0.8) / 3;
    [["FM-index on the haplotypes", "Simple and lossless, but the same seed is reported once per haplotype: 464 copies of every hit.", "ropebwt3"],
     ["FM-index on the graph", "Deduplicated positions, but construction needs graph transformations that are fragile and can drop parts of haplotypes.", "HISAT2, vg map"],
     ["Minimizer indexes", "Fast, but the seed length is fixed in advance: a permanent trade of sensitivity for specificity.", "vg giraffe"]].forEach(([a, b, c], i) => { const x = M + i * (cw + 0.4);
      txt(s, a, x, T + 0.1, cw, 0.6, { fontSize: 21, bold: true, color: C.navy });
      s.addShape(pres.shapes.LINE, { x, y: T + 0.85, w: cw, h: 0, line: { color: C.hair, width: 1 } });
      txt(s, b, x, T + 1.05, cw, 2.2, { fontSize: 17 });
      txt(s, c, x, T + 3.3, cw, 0.4, { fontSize: 14, color: C.muted }); });
    soft(s, M, T + 4.05, W - 2 * M, 1.0);
    txt(s, "Tag arrays: keep the FM-index on the haplotypes, and annotate the BWT with graph positions. Lossless, deduplicated, any seed length.", M + 0.3, T + 4.05, W - 2 * M - 0.6, 1.0, { fontSize: 19, bold: true, color: C.navy, align: "center", valign: "middle" });
    notes(s, `[3:20-4:05]
A brief word on the index, because everything rests on it.
Indexing a pangenome used to force a choice. An FM-index on the haplotype sequences is simple and lossless, but reports the same seed once per haplotype. An FM-index on the graph deduplicates, but needs graph transformations that are fragile and can lose parts of haplotypes. Minimizer indexes are fast, but the seed length is fixed in advance.
Tag arrays take a different route: keep the FM-index on the haplotypes, and annotate the BWT with graph positions. Lossless, deduplicated, any seed length.`); }

  // ================= 7. TAG ARRAYS: WHAT THEY ARE =================
  { const s = light("Tag arrays: every BWT position knows its node", "Tag arrays");
    const iw = 7.6; img(s, "own/tag2_0.png", M, T + 0.1, iw);
    const rx = M + iw + 0.5, rw = W - M - rx;
    [["Query", "The r-index finds the BWT interval for a pattern. Two rank queries on the run-length tag structure return the distinct graph positions in it: no scan, no decompression."],
     ["Runs, not positions", "Similar suffixes sit together, so tags come in long runs. Bases grew 5x from v1.1 to v2.0; tag runs only 2x."],
     ["Built at HPRC scale", "Per chromosome, then merged through the multi-string BWT. v2.0: 464 haplotypes, 2.6 Tbp, 26 billion tag runs, 149 GiB; a 23 GiB sampled tag array serves translation."]]
      .forEach(([a, b], k) => { const y = T + 0.1 + k * 1.75; txt(s, a, rx, y, rw, 0.4, { fontSize: 18, bold: true, color: C.navy }); txt(s, b, rx, y + 0.42, rw, 1.3, { fontSize: 15 }); });
    txt(s, "Eskandar, Paten, Sirén. Lossless pangenome indexing using tag arrays. WABI 2025; Algorithms for Molecular Biology 2026.", M, 6.75, W - 2 * M, 0.4, { fontSize: 13, color: C.muted, align: "center" });
    notes(s, `[4:05-5:05]
Here is the whole idea on a toy graph. Three haplotypes, one BWT over their sequences. The tag array runs alongside the BWT: for every BWT position, the graph node and offset it came from.
A query is two steps. The r-index finds the BWT interval for a pattern, exactly as an FM-index would. Then two rank queries on the run-length tag structure return the distinct graph positions in that interval. No scan, no decompression, and no redundancy: one hit per graph position, however many haplotypes share it.
It stays small because similar suffixes sit together, so tags come in long runs. From v1.1 to v2.0 the sequence grew fivefold; the tag runs only doubled. We build it per chromosome and merge through the multi-string BWT. For the release 2 graph: 464 haplotypes, 2.6 terabases of sequence, 26 billion tag runs, 149 gigabytes, plus a 23 gigabyte sampled tag array that serves coordinate translation.`); }

  // ================= 8. TAG ARRAYS -> TRANSLATION =================
  { const s = light("From tags to translation: a walk, not a lookup", "Tag arrays");
    const iw = 7.0; const yb = img(s, "own/tag4_0.png", M, T + 0.9, iw);
    txt(s, "source: orange, positions 3 to 7   •   target: purple", M, yb + 0.15, iw, 0.4, { fontSize: 15, color: C.muted, align: "center" });
    const rx = M + iw + 0.6, rw = W - M - rx;
    [["1", "Walk the source interval backwards with the r-index; collect the sampled tags it passes: nodes b, e, f."],
     ["2", "For each tag, the sampled tag array lists every haplotype at that graph position. Purple stands on b and f."],
     ["3", "Nodes both haplotypes visit exactly once anchor the two paths: b and f."],
     ["4", "Walk both paths between the anchors and emit offsets: orange 3 to purple 3, orange 6 to purple 6; orange 5 sits on node e, which purple never visits: no position, never a wrong one."]]
      .forEach(([k, t], i) => { const y = T + 0.05 + i * 1.15;
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: y + 0.02, w: 0.42, h: 0.42, fill: { color: C.gold }, line: { color: C.gold, width: 0 }, rectRadius: 0.08 });
        txt(s, k, rx, y + 0.02, 0.42, 0.42, { fontSize: 16, bold: true, color: C.navydeep, align: "center", valign: "middle" });
        txt(s, t, rx + 0.6, y, rw - 0.6, 1.1, { fontSize: 15.5 }); });
    takeaway(s, "The output has chain semantics, so the browser's own lift-over renderer draws it.", 6.55);
    notes(s, `[5:05-6:05]
And the same structure gives us coordinate translation, without a single pairwise table.
Take the orange haplotype from position 3 to 7, and ask where that lands on purple. One: walk the interval backwards with the r-index and collect the sampled tags it passes: nodes b, e and f. Two: for each tag, the sampled tag array lists every haplotype standing at that graph position, so we learn purple is on b and on f. Three: nodes both haplotypes visit exactly once anchor the two paths. Four: walk both paths between the anchors and emit offsets. Orange 3 maps to purple 3, orange 6 to purple 6, and orange 5 sits on node e, which purple never visits: no position, never a wrong one.
Nothing anywhere says orange-to-purple. Any haplotype to any haplotype, from one index. And the output has chain semantics, so the browser's existing lift-over renderer can draw it.`); }

  // ================= 9. SCENARIO 1: RECORDING =================
  { const s = light("Scenario 1: a sequence GRCh38 doesn't have", "Scenario 1");
    const vw = 8.6, vh = vw * 9 / 16; video(s, "scenario1.mp4", M, T + 0.05, vw, vh, "Screen recording: Pangenome Mapping");
    const rx = M + vw + 0.5, rw = W - M - rx;
    txt(s, "What you are watching", rx, T + 0.05, rw, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
    bullets(s, ["She pastes the insertion sequence into Pangenome Mapping.", "vg giraffe maps it once, to the whole graph.", "Every haplotype that carries it comes back, ranked by identity: two of 464, and GRCh38 is not one of them.", "She clicks a carrier and lands in the browser, with her sequence drawn as a track."], rx, T + 0.5, rw, 4.4, { fontSize: 16 });
    notes(s, `[6:05-7:35]  Play the recording; narrate over it.
First afternoon. This is the Pangenome Mapping page, BLAT for the pangenome.
She pastes the insertion. It is mapped once, to the whole graph, with vg giraffe, in a few seconds. And here is what BLAT could never have told her: exactly two of the 464 haplotypes carry this sequence, HG01167 hap1 and HG04157 paternal, and GRCh38 is not one of them. They're ranked by identity, with coverage beside it.
She clicks HG01167. No special page: she lands in the browser, on a genome that actually has her insertion, with the sequence as a native track, base-level differences colored the way BLAT users already know, and that haplotype's own annotation around it.
Picking a different carrier re-surjects the same alignment; nothing is remapped.`); }

  // ================= 10. SCENARIO 1: WHAT IT SOLVES =================
  { const s = light("What that changes on release 2", "Scenario 1");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "Before", M, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.muted, charSpacing: 2 });
    bullets(s, ["BLAT against one assembly at a time; 464 to choose from, and no way to know which.", "A sequence missing from hg38 is simply unmapped.", "No notion of who else carries it, or how common it is."], M, T + 0.5, cw, 2.4, { fontSize: 17, color: C.muted });
    txt(s, "Now", M + cw + 0.6, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
    bullets(s, ["One search against the whole graph; every carrying haplotype, ranked.", "Sequences absent from the reference are found where they live.", "Land on any carrier as a native track, with base-level differences.", "Re-surject to another haplotype without remapping."], M + cw + 0.6, T + 0.5, cw, 2.9, { fontSize: 17 });
    frame(s, "crop_mapping_result.png", M, T + 3.45, W - 2 * M, 2.75);
    notes(s, `[7:35-8:10]
So, what does that change on release 2? Before: BLAT one assembly at a time, with 464 to choose from and no way to know which; a sequence missing from hg38 was simply unmapped; nothing told you who else carried it. Now: one search against the whole graph returns every carrying haplotype, ranked. Sequences absent from the reference are found where they actually live. You land on any carrier as a native track, and re-surjecting to another haplotype costs nothing.
One detail this room will notice: MAPQ is zero by design. In a graph where every locus exists hundreds of times, mapping quality carries no information; per-haplotype identity and coverage replace it.`); }

  // ================= 11. SCENARIO 2: TODAY =================
  { const s = light("Scenario 2, today: QuickLift needs a chain per pair", "Scenario 2");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "QuickLift, in the browser since 2025", M, T + 0.05, cw, 0.5, { fontSize: 21, bold: true, color: C.navy });
    bullets(s, ["View > In Other Genomes, tick \"QuickLift tracks\": your tracks are drawn on the other assembly, differences marked with vertical bars.", "Needs a prebuilt liftOver chain between the two assemblies, made by UCSC on request.", "Superb for hg38 to hs1. Between HPRC haplotypes: 56 chains, out of 200,000+ pairs."], M, T + 0.7, cw, 3.6, { fontSize: 17 });
    const x2 = M + cw + 0.6; const gh = img(s, "grids.png", x2, T + 0.3, cw);
    txt(s, "She picks HG02015 from the menu. There is no chain. Dead end.", x2, gh + 0.3, cw, 1.0, { fontSize: 19, italic: true, color: C.navy, align: "center" });
    takeaway(s, "The renderer is ready. The missing piece is a chain for any pair, on demand.");
    notes(s, `[8:10-8:45]
Second afternoon. She has a gene open on a reference, ClinVar and GWAS beside it, and she wants that locus on one HPRC individual.
The browser already has the right tool: QuickLift. View, In Other Genomes, tick QuickLift tracks, and your tracks are drawn on the other assembly with the differences marked. It is superb for hg38 to hs1.
But it needs a prebuilt chain between the two assemblies, made on request. Between HPRC haplotypes the browser has fifty-six, out of more than two hundred thousand pairs. She picks HG02015. There is no chain. Dead end.
The renderer is ready. What's missing is a chain for any pair, on demand. That is exactly what the walk I just showed you produces.`); }

  // ================= 12. SCENARIO 2: RECORDING =================
  { const s = light("Scenario 2: the gene she knows, on HG02015", "Scenario 2");
    const vw = 8.6, vh = vw * 9 / 16; video(s, "scenario2.mp4", M, T + 0.05, vw, vh, "Screen recording: Convert Coordinates and land with annotations");
    const rx = M + vw + 0.5, rw = W - M - rx;
    txt(s, "What you are watching", rx, T + 0.05, rw, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
    bullets(s, ["Source: the gene's coordinates on the reference she was using.", "Target: HG02015 paternal, picked from all 464; the picker can show only haplotypes that contain the region.", "Translated in about 100 ms, 100% of bases.", "She clicks through: the reference's tracks are drawn on HG02015, with insertions, deletions and mismatches marked."], rx, T + 0.5, rw, 4.4, { fontSize: 16 });
    notes(s, `[8:45-10:25]  Play the recording; narrate over it. SLOW DOWN at the landing.
Now the same afternoon with our tool. Source: the gene she was looking at, here HLA-DMA on CHM13, ten kilobases on chromosome 6; GRCh38 is a path in this graph too, so hg38 works exactly the same way. Target: HG02015 paternal, the haplotype that was a dead end a minute ago.
Translated in about a hundred milliseconds. A hundred percent of bases.
She clicks the result, and this is the part I care about most. HG02015 has its own CAT and Liftoff genes from release 2. What it will never have is everything that exists once, on one reference: ClinVar, the GWAS catalog, ENCODE, her own BED file. And here they are, drawn at their translated positions, with the differences marked the way QuickLift users already read them.
(pause) The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain; the browser's own QuickLift renderer drew the tracks. Same QuickLift. The chain just isn't prebuilt anymore.`); }

  // ================= 13. SCENARIO 2: WHAT IT SOLVES =================
  { const s = light("What that changes on release 2", "Scenario 2");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "Before", M, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.muted, charSpacing: 2 });
    bullets(s, ["Lift-over only between pairs with a prebuilt chain: 56 of 200,000+.", "New chains made by UCSC on request, one pair at a time.", "A haplotype without a chain shows only its own tracks."], M, T + 0.5, cw, 2.4, { fontSize: 17, color: C.muted });
    txt(s, "Now", M + cw + 0.6, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
    bullets(s, ["Any of 464 haplotypes as the target, from hg38 or CHM13, in about 100 ms.", "The chain is built for the region you are looking at and reused as you pan.", "The reference's tracks come along; an Alignment Differences track marks indels and mismatches.", "Also in the ordinary hgConvert menu: same button, new capability."], M + cw + 0.6, T + 0.5, cw, 2.9, { fontSize: 17 });
    frame(s, "crop_lifted.png", M, T + 3.45, W - 2 * M, 2.75);
    notes(s, `[10:25-11:00]
Before: lift-over only between pairs with a prebuilt chain, fifty-six of two hundred thousand, new ones made on request, and a haplotype without a chain showed only its own tracks. Now: any of the 464 haplotypes as the target, from hg38 or CHM13, in about a hundred milliseconds; the chain is built for the region you're looking at and reused as you pan; the reference's tracks come along with the differences marked; and it's in the ordinary hgConvert menu too.
That is what I mean by making release 2 useful: the thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. Any haplotype can borrow them, on demand.`); }

  // ================= 14. WHO THIS HELPS =================
  { const s = light("Who this is for");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "Clinicians and variant curators", M, T + 0.05, cw, 0.5, { fontSize: 21, bold: true, color: C.navy });
    s.addShape(pres.shapes.LINE, { x: M, y: T + 0.65, w: cw, h: 0, line: { color: C.hair, width: 1 } });
    bullets(s, ["Is this insertion or SV sequence private to my patient, or carried by HPRC individuals? Which ones?", "ClinVar and GWAS context for a locus on the haplotype that actually carries the patient's allele.", "Complex loci where one reference misleads: HLA, KIR, CYP2D6, LPA, SMN1/2, seen on many haplotypes with the reference annotation drawn there."], M, T + 0.85, cw, 4.0, { fontSize: 16.5 });
    const x2 = M + cw + 0.6;
    txt(s, "Researchers and graph builders", x2, T + 0.05, cw, 0.5, { fontSize: 21, bold: true, color: C.navy });
    s.addShape(pres.shapes.LINE, { x: x2, y: T + 0.65, w: cw, h: 0, line: { color: C.hair, width: 1 } });
    bullets(s, ["Place contigs, probes, primers or guide RNAs on every haplotype at once; see which haplotypes lack the site.", "Move any reference annotation, or your own tracks, onto any assembly; compare a locus across individuals.", "Inspect the graph's alignment itself: the Alignment Differences track is the graph, drawn base by base."], x2, T + 0.85, cw, 4.0, { fontSize: 16.5 });
    takeaway(s, "No pipeline, no download: a browser tab and a sequence or a position.", 6.4);
    notes(s, `[11:00-11:45]
Who is this for? For clinicians and curators: is this insertion private to my patient, or carried by HPRC individuals, and which ones? ClinVar and GWAS context on the haplotype that actually carries the patient's allele. And the complex loci where one reference misleads, HLA, KIR, CYP2D6, LPA, SMN, seen on many haplotypes with the reference annotation drawn there.
For researchers and graph builders: place contigs, probes, primers or guide RNAs on every haplotype at once; move any annotation, including your own tracks, onto any assembly; and inspect the graph's alignment itself, because the Alignment Differences track is the graph, drawn base by base.
No pipeline, no download. A browser tab, and a sequence or a position.`); }

  // ================= 15. CHECKED AND FAST =================
  { const s = light("Checked so far, and fast enough");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "Checked", M, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.teal, charSpacing: 2 });
    bullets(s, ["Alignment Differences, base by base: 22 kb of ABO, hs1 vs HG00597#1, exactly the 2 real mismatches.", "Completeness by span: 99% up to 10 kb, 97% at 100 kb, 93% at 1 Mb.", "Hard case: a 37 kb segdup-dense span on 1q21.1 recovers 46% of bases. Missing positions, not wrong ones."], M, T + 0.45, cw, 2.6, { fontSize: 15.5 });
    txt(s, "Not yet", M, T + 3.15, cw, 0.4, { fontSize: 14, bold: true, color: C.coral, charSpacing: 2 });
    bullets(s, ["halLiftover on the same Cactus alignment; the 56 existing chains; CHM13 CAT transcripts against a haplotype's own CAT annotation. Those come before public release."], M, T + 3.55, cw, 1.4, { fontSize: 15.5 });
    const rx = M + cw + 0.6; txt(s, "Translation latency, median", rx, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.navy, charSpacing: 2 });
    const rowsL = [["up to 1 kb", 21, "~20 ms"], ["10 kb", 115, "115 ms"], ["100 kb", 599, "0.6 s"], ["1 Mb", 4300, "4.3 s"]];
    const ax0 = rx + 1.6, axW = cw - 3.2, y0 = T + 1.0, pitch = 0.8; const xv = v => ax0 + (Math.log10(v) - 1) * axW / 3;
    [10, 100, 1000, 10000].forEach((d, i) => { const x = xv(d); s.addShape(pres.shapes.LINE, { x, y: y0 - 0.3, w: 0, h: pitch * 3 + 0.6, line: { color: C.hair, width: 1, dashType: "dash" } });
      txt(s, ["10 ms", "100 ms", "1 s", "10 s"][i], x - 0.5, y0 + pitch * 3 + 0.4, 1.0, 0.35, { fontSize: 13, color: C.muted, align: "center" }); });
    rowsL.forEach(([lab, v, vl], i) => { const y = y0 + i * pitch, x = xv(v);
      txt(s, lab, rx, y - 0.2, 1.4, 0.4, { fontSize: 15, align: "right", valign: "middle" });
      s.addShape(pres.shapes.LINE, { x: ax0, y, w: x - ax0, h: 0, line: { color: C.stem, width: 3 } });
      s.addShape(pres.shapes.OVAL, { x: x - 0.11, y: y - 0.11, w: 0.22, h: 0.22, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
      txt(s, vl, x + 0.2, y - 0.2, 1.4, 0.4, { fontSize: 17, bold: true, color: C.navy, valign: "middle" }); });
    txt(s, "One server sustains about 60 queries a second; the index is read-only and thread-safe.", rx, T + 4.2, cw, 0.8, { fontSize: 15, color: C.muted });
    notes(s, `[11:45-12:35]
Trust before speed, and I want to be straight about which numbers I have. Checked: the Alignment Differences track, base by base across 22 kb of ABO, exactly the two real mismatches; completeness 99% at gene scale and 93% at a megabase; and one hard case, a segdup-dense span on 1q21.1 recovering about half its bases. Missing positions, never wrong ones. Not yet: halLiftover on the same Cactus alignment, the 56 existing chains, and CAT transcripts against a haplotype's own annotation. Those come before public release.
Speed: exon-scale intervals in about twenty milliseconds, a ten-kilobase gene in a tenth of a second, a megabase in about four, and one server sustains about sixty queries a second.`); }

  // ================= 16. LIMITS AND NEXT =================
  { const s = light("Real limits, and what's next");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "Today", M, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.muted, charSpacing: 2 });
    bullets(s, ["Chains are built per view. Pan far enough and another one is built.", "Segdup-dense spans lose positions: 46% recovered on 1q21.1.", "Development browser only. One service, about 250 GB of RAM. No public API yet."], M, T + 0.5, cw, 2.9, { fontSize: 17 });
    const x2 = M + cw + 0.6; txt(s, "Next", x2, T + 0.05, cw, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
    bullets(s, ["Shared, persistent chains: popular regions free after the first visit.", "Better recovery in segdup-dense spans.", "A documented JSON API, so it runs from your pipeline too.", "New graphs plug in by building one index."], x2, T + 0.5, cw, 2.9, { fontSize: 17 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: T + 3.8, w: W - 2 * M, h: 1.0, fill: { color: C.navydeep }, line: { color: C.navydeep, width: 0 }, rectRadius: 0.1 });
    s.addText([{ text: "Next milestone: ", options: { color: C.dim } }, { text: "public release in the UCSC Genome Browser", options: { color: C.white, bold: true } }],
      { x: M, y: T + 3.8, w: W - 2 * M, h: 1.0, fontFace: FONT, fontSize: 24, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    notes(s, `[12:35-13:30]
Two things I want to be honest about. Chains are built per view, so if you pan far enough we build another one. And wide, segdup-dense spans lose positions: on 1q21.1 we recover about half. Missing, not wrong. This runs on the development browser, as one service with about 250 gigabytes of RAM, and there is no public API yet.
Next: chains that persist and are shared across users; better recovery in segdups; a documented JSON API, because half of you will want this from a pipeline; and more graphs, since nothing here is specific to release 2.
And the milestone all of that serves: the public UCSC Genome Browser.`); }

  // ================= 17. CLOSE =================
  { const s = dark();
    txt(s, "Both afternoons, served", M, 0.5, W - 2 * M, 0.8, { fontSize: 30, bold: true, color: C.white, valign: "middle" });
    const done = ["two carriers found in seconds; her insertion mapped as a track on a genome that has it", "HG02015 in ~100 ms, with the reference's tracks drawn around the gene, over a chain built on the spot"];
    U.forEach(([tag, a, b], k) => { const x = M + k * (cw2 + 0.6);
      txt(s, tag, x, T + 0.1, cw2, 0.4, { fontSize: 14, bold: true, color: C.gold, charSpacing: 2 });
      txt(s, a, x, T + 0.5, cw2, 0.6, { fontSize: 24, bold: true, color: C.white });
      s.addShape(pres.shapes.LINE, { x, y: T + 1.25, w: cw2, h: 0, line: { color: C.dimdark, width: 1 } });
      txt(s, b, x, T + 1.45, cw2, 1.6, { fontSize: 19, color: C.dim });
      txt(s, done[k], x, T + 3.15, cw2, 0.7, { fontSize: 15, color: C.dim });
      txt(s, "done", x, T + 3.85, cw2, 0.7, { fontSize: 40, bold: true, color: C.gold, valign: "middle" }); });
    txt(s, "Live on the development browser today. Bring me your hardest region, and tell me where it breaks.", M, 6.45, W - 2 * M, 0.6, { fontSize: 22, italic: true, color: C.gold, align: "center", valign: "middle" });
    notes(s, `[13:30-14:10]
So, back to her two afternoons. The insertion that isn't in GRCh38: two carriers found in seconds, and mapped as a track on a genome that has it. The gene she knew on a reference: on HG02015 in a tenth of a second, with the reference's tracks drawn around it, over a chain that didn't exist until she asked.
It's live on the development browser today. So bring me your hardest region, and tell me where it breaks.
(Advance to thanks. Let it breathe. Then questions.)`); }

  // ================= 18. THANKS =================
  { const s = dark();
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.3, w: W, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    s.addImage({ path: path.join(FIG, "emblem2.png"), x: W - M - 5.5, y: 2.315 - 5.5 * 392 / 1678 / 2, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: M, y: 0.5, w: 1.3, h: 1.3 * 1540 / 1855 });
    txt(s, "Thank you", M, 2.7, 6, 0.7, { fontSize: 32, bold: true, color: C.white });
    txt(s, "seeskand@ucsc.edu", M, 3.6, 6.5, 0.5, { fontFace: "Courier New", fontSize: 22, color: C.gold });
    txt(s, "github.com/parsaeskandar/pangenome-index   •   github.com/parsaeskandar/hprc_2026_poster", M, 4.1, 11, 0.45, { fontFace: "Courier New", fontSize: 15, color: C.gold });
    txt(s, "Index, poster, slides and figures are in the repositories.", M, 4.6, 8, 0.4, { fontSize: 16, color: C.dim });
    s.addText([{ text: "Jouni Sirén  •  Benedict Paten", options: { color: C.white, fontSize: 18, breakLine: true } },
      { text: "UC Santa Cruz Computational Genomics Lab: Adam Novak, Glenn Hickey, Zia Truong, Mark Diekhans", options: { color: C.dim, fontSize: 16, breakLine: true } },
      { text: "The UCSC Genome Browser team  •  The Human Pangenome Reference Consortium", options: { color: C.dim, fontSize: 16, breakLine: true } },
      { text: "Built on vg and the HPRC v2.0 graph", options: { color: C.dim, fontSize: 16 } }],
      { x: M, y: 5.35, w: W - 2 * M, h: 1.7, fontFace: FONT, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 6 });
    notes(s, `[14:10-14:25]
None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you. Questions.`); }

  // ================= BACKUP =================
  { const s = dark(); s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: 3.35, w: 0.05, h: 0.75, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    txt(s, "Backup", 6.15, 3.3, 4, 0.85, { fontSize: 32, bold: true, color: C.white, valign: "middle" }); notes(s, "Backup slides for questions."); }
  { const s = light("Backup: translation at scale");
    const iw = 7.6; img(s, "translation.png", M, T + 0.1, iw);
    const rx = M + iw + 0.5, rw = W - M - rx;
    ["Find the query's nodes on the source path.", "Ask the tag arrays who else is here.", "Nodes both visit exactly once: unambiguous anchors. Orthology is the graph's.", "Walk between anchors, base by base; group shared offsets into chain blocks. A block breaks on an indel, never on a SNP; an inversion starts a new chain."]
      .forEach((t, i) => { const y = T + 0.15 + i * 1.2; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: y + 0.02, w: 0.42, h: 0.42, fill: { color: C.gold }, line: { color: C.gold, width: 0 }, rectRadius: 0.08 });
        txt(s, String(i + 1), rx, y + 0.02, 0.42, 0.42, { fontSize: 16, bold: true, color: C.navydeep, align: "center", valign: "middle" }); txt(s, t, rx + 0.6, y, rw - 0.6, 1.1, { fontSize: 16 }); });
    notes(s, "Backup: the same walk on the real graph, with a colinearity gate between anchors and chain-semantics blocks as output."); }
  { const s = light("Backup: anchors and blocks, precisely");
    const cw = (W - 2 * M - 0.6) / 2;
    txt(s, "Anchors", M, T + 0.05, cw, 0.5, { fontSize: 21, bold: true, color: C.navy });
    bullets(s, ["A node visited exactly once by the source path and exactly once by the target path is an unambiguous anchor with respect to the graph's alignment: our procedure cannot create a false one; a paralogy collapsed in the graph still can.", "A colinearity gate rejects anchor pairs whose target span is wildly inconsistent with the source span.", "The failure mode in hard regions is missing positions, never wrong ones."], M, T + 0.7, cw, 4.0, { fontSize: 16 });
    txt(s, "Blocks and chains", M + cw + 0.6, T + 0.05, cw, 0.5, { fontSize: 21, bold: true, color: C.navy });
    bullets(s, ["An LF-walk between anchors emits a per-base correspondence.", "A block is a maximal run of constant offset: it breaks on indels, never on substitutions. Orientation flips and non-colinear jumps start a new chain.", "Blocks are 0-based, half-open, and become bigChain + bigLink files the browser's QuickLift draws directly."], M + cw + 0.6, T + 0.7, cw, 4.0, { fontSize: 16 });
    notes(s, "Backup: for questions about accuracy in repeats, or how the output relates to chain files."); }
  { const s = light("Backup: chains that keep up with panning");
    bullets(s, ["The request is padded to 5x its span (250 kb to 1 Mb) before the chain is built, so a gene-sized view gets a ~1 Mb chain.", "As the page navigates, the server rebuilds the same chain at +/-5 Mb in the background (about 11 s, off the user's path). The browser reopens the chain file on every request, so the next pan picks it up with no reload.", "Lifted gene items visible 4 Mb from the conversion: 1 with the first chain, 31 with the widened one."], M, T + 0.1, 5.9, 4.8, { fontSize: 17 });
    s.addChart(pres.charts.BAR, [{ name: "first chain (1.1 Mb)", labels: ["in window", "400 kb", "2 Mb", "4 Mb"], values: [3, 129, 1, 1] }, { name: "widened chain (10 Mb)", labels: ["in window", "400 kb", "2 Mb", "4 Mb"], values: [3, 129, 5, 31] }],
      { x: 7.0, y: T, w: W - M - 7.0, h: 4.9, barDir: "col", chartColors: [C.gold, C.navy], fontFace: FONT, showLegend: true, legendPos: "t", legendFontSize: 14, showTitle: true, title: "Lifted gene items after panning away (log scale)", titleColor: C.navy, titleFontSize: 16, titleFontFace: FONT,
        valAxisLogScaleBase: 10, valAxisMinVal: 0.1, valAxisMaxVal: 1000, catAxisLabelColor: C.ink, valAxisLabelColor: C.ink, catAxisLabelFontSize: 14, valAxisLabelFontSize: 14, valGridLine: { color: C.hair, size: 0.5 }, catGridLine: { style: "none" }, showValue: false });
    notes(s, "Backup: how on-demand chains still let users pan and zoom."); }
  { const s = light("Backup: by the numbers");
    const items = [["148M", "nodes in the HPRC v2.0 Minigraph-Cactus graph", C.navy], ["464", "haplotypes indexed, CHM13 and GRCh38 included", C.navy], ["2.6 Tbp", "bidirectional sequence in the index", C.navy], ["26 B", "tag array runs (4.9 B BWT runs)", C.navy],
      ["149 GiB", "tag array index; 23 GiB sampled tag array", C.teal], ["~250 GB", "RAM for the running service", C.teal], ["15 lines", "changed in kent core, across 3 files", C.navy], ["385", "browser-side tests: payload validation, UI, hub writes", C.navy]];
    const cw = (W - 2 * M - 0.9) / 4, chh = 2.3;
    items.forEach(([a, b, col], i) => { const x = M + (i % 4) * (cw + 0.3), y = T + Math.floor(i / 4) * (chh + 0.35);
      soft(s, x, y, cw, chh); txt(s, a, x, y + 0.35, cw, 0.8, { fontSize: 30, bold: true, color: col, align: "center", valign: "middle" }); txt(s, b, x + 0.25, y + 1.25, cw - 0.5, 1.0, { fontSize: 15, color: C.muted, align: "center" }); });
    notes(s, "Backup: sizes and costs. Index numbers from the Algorithms for Molecular Biology paper (bidirectional index)."); }

  await pres.writeFile({ fileName: OUT }); console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
