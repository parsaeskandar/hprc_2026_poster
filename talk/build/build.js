// HPRC 2026 talk deck generator (pptxgenjs) — v2 after three-reviewer pass
const pptxgen = require("pptxgenjs"); const React = require("react"); const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp"); const path = require("path"); const fs = require("fs"); const fa = require("react-icons/fa");
const VID = path.join(__dirname, "..", "figures", "videos");
const FIG = path.join(__dirname, "..", "figures"); const OUT = path.join(__dirname, "..", "HPRC2026_talk.pptx");

const C = { navy: "003C6C", navydeep: "06294A", cardDark: "0F3557", cardDarkLine: "1D4F7C", ink: "18293B", muted: "5B6B7C",
  gold: "FDC700", teal: "0E7C9C", coral: "E4572E", white: "FFFFFF", card: "EDF1F6", cardLine: "DCE3EB", hair: "D9E1E9",
  dim: "C6D3DF", dimdark: "3D5A7A", grid: "17436B", stem: "B8C7D6", dots: "CBD5E0" };
const FONT = "Calibri", W = 13.333, H = 7.5, M = 0.6, T = 1.45;
const IMG = { "crop_mapping_input.png": [2060, 330], "crop_mapping_result.png": [2060, 675], "crop_seqtrack.png": [1650, 430],
  "crop_convert.png": [2200, 1578], "crop_dropdown.png": [1800, 850], "grids.png": [2783, 982], "crop_lifted.png": [1750, 547],
  "translation.png": [2691, 1715], "tagarray.png": [2630, 1384], "emblem.png": [1678, 392], "emblem2.png": [1678, 392], "hprc_logo.png": [1855, 1540], "own/tag2_0.png": [1930, 1284], "own/tag4_0.png": [1032, 402] };
async function icon(name, color, px = 256) { const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: px }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer()).toString("base64"); }

(async () => {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Parsa Eskandar";
  pres.title = "A pangenome sequence search and coordinate translation service for the UCSC Genome Browser";
  const ic = {}; for (const k of ["FaSearch", "FaRandom", "FaLayerGroup", "FaCheck", "FaExclamation", "FaRocket", "FaUserMd", "FaFlask"]) ic[k] = await icon(k, C.white);

  let n = 0;
  const num = (s, dark) => { n++; s.addText(String(n), { x: W - M - 0.5, y: H - 0.45, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10, color: dark ? C.dimdark : C.hair, align: "right", isTextBox: true, margin: 0 }); };
  const notes = (s, t) => s.addNotes(t.trim());
  const txt = (s, text, x, y, w, h, o = {}) => s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 18, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  const bullets = (s, items, x, y, w, h, o = {}) => s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: i < items.length - 1, paraSpaceAfter: 9 } })),
    Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 18, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  const light = (title) => { const s = pres.addSlide(); s.background = { color: C.white };
    txt(s, title, M, 0.42, W - 2 * M - 2.3, 0.78, { fontSize: 32, bold: true, color: C.navy, valign: "middle" }); num(s, false); return s; };
  const dark = () => { const s = pres.addSlide(); s.background = { color: C.navydeep }; num(s, true); return s; };
  const card = (s, x, y, w, h, fill = C.card, line = C.cardLine) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: line, width: 1 }, rectRadius: 0.12 });
  const circleIcon = (s, data, x, y, d, fill = C.navy) => { s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } }); const p = d * 0.26; s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p }); };
  const chip = (s, label, x, y, d = 0.46) => { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, fill: { color: C.gold }, line: { color: C.gold, width: 0 }, rectRadius: 0.09 });
    txt(s, label, x, y, d, d, { fontSize: 18, bold: true, color: C.navydeep, align: "center", valign: "middle" }); };
  const takeaway = (s, text, y = 6.4) => txt(s, text, M, y, W - 2 * M, 0.6, { fontSize: 20, italic: true, color: C.navy, align: "center", valign: "middle" });
  const qtag = (s, label) => txt(s, label, W - M - 2.2, 0.42, 2.2, 0.78, { fontSize: 16, bold: true, color: C.navy, align: "right", valign: "middle" });
  // video slot: embeds figures/videos/<name>.mp4 if present, otherwise a clean placeholder
  function video(s, name, x, y, w, h, label) {
    const p = path.join(VID, name);
    if (fs.existsSync(p)) { s.addMedia({ type: "video", path: p, x, y, w, h }); return true; }
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: C.navydeep }, line: { color: C.navydeep, width: 0 }, rectRadius: 0.12 });
    s.addShape(pres.shapes.OVAL, { x: x + w / 2 - 0.5, y: y + h / 2 - 0.6, w: 1.0, h: 1.0, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    s.addShape(pres.shapes.ISOSCELES_TRIANGLE, { x: x + w / 2 - 0.17, y: y + h / 2 - 0.32, w: 0.42, h: 0.44, rotate: 90, fill: { color: C.navydeep }, line: { color: C.navydeep, width: 0 } });
    txt(s, label, x, y + h - 0.95, w, 0.4, { fontSize: 16, color: C.dim, align: "center" });
    txt(s, "drop " + name + " into talk/figures/videos and rebuild, or Insert > Video here", x, y + h - 0.55, w, 0.35, { fontSize: 11, color: C.dimdark, align: "center" });
    return false;
  }
  // browser frame: one or more stacked images of equal width
  function browser(s, files, x, y, w, maxH) {
    const chrome = 0.34, pad = 0.12, gap = 0.12; let iw = w - 2 * pad;
    let hs = files.map(f => iw * IMG[f][1] / IMG[f][0]); let total = chrome + hs.reduce((a, b) => a + b, 0) + gap * (files.length - 1) + pad;
    if (maxH && total > maxH) { const k = (maxH - chrome - pad - gap * (files.length - 1)) / hs.reduce((a, b) => a + b, 0); iw *= k; hs = hs.map(h => h * k); total = maxH; }
    const fw = iw + 2 * pad; const fx = x + (w - fw) / 2;
    card(s, fx, y, fw, total, C.card, C.cardLine);
    for (let i = 0; i < 3; i++) s.addShape(pres.shapes.OVAL, { x: fx + 0.16 + i * 0.18, y: y + 0.1, w: 0.11, h: 0.11, fill: { color: C.dots }, line: { color: C.dots, width: 0 } });
    txt(s, "genome.ucsc.edu", fx + 0.85, y + 0.03, 4, 0.26, { fontFace: "Courier New", fontSize: 9, color: C.muted, valign: "middle" });
    let cy = y + chrome; files.forEach((f, i) => { s.addImage({ path: path.join(FIG, f), x: fx + pad, y: cy, w: iw, h: hs[i] }); cy += hs[i] + gap; });
    return { bottom: y + total, x: fx, w: fw };
  }

  // ============ 1. TITLE ============
  { const s = dark();
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.55, w: W, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    s.addImage({ path: path.join(FIG, "emblem.png"), x: W - M - 5.5, y: 2.565 - 5.5 * 392 / 1678 / 2, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: M, y: 0.45, w: 1.4, h: 1.4 * 1540 / 1855 });
    txt(s, "HPRC 2026", M, 2.05, 4, 0.35, { fontSize: 14, bold: true, color: C.gold, charSpacing: 3 });
    s.addText([{ text: "The UCSC Genome Browser", options: { breakLine: true } }, { text: "now speaks pangenome.", options: { color: C.gold } }],
      { x: M, y: 2.85, w: 9.5, h: 1.7, fontFace: FONT, fontSize: 44, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "top" });
    txt(s, "Sequence search and coordinate translation across all 464 HPRC haplotypes", M, 4.65, 11.5, 0.5, { fontSize: 20, color: C.white });
    txt(s, "Live on the development browser today", M, 5.2, 9.5, 0.4, { fontSize: 16, color: C.dim });
    txt(s, "Parsa Eskandar   •   Jouni Sirén   •   Benedict Paten", M, 6.05, 10, 0.45, { fontSize: 18, color: C.white });
    txt(s, "UC Santa Cruz Genomics Institute", M, 6.5, 10, 0.4, { fontSize: 16, color: C.dim });
    notes(s, `[0:00-0:15]
Thanks. I'm Parsa Eskandar, from Benedict Paten's lab at UC Santa Cruz, and this is joint work with Jouni Sirén and the UCSC Genome Browser team.
(Don't linger. Advance.)`); }

  // ============ 2. COLD OPEN ============
  { const s = dark();
    txt(s, "464", M, 0.85, 5.6, 2.0, { fontSize: 120, bold: true, color: C.gold, valign: "middle" });
    txt(s, "haplotype assemblies the Genome Browser can open", M, 2.85, 5.6, 0.9, { fontSize: 22, color: C.white });
    txt(s, "56", 7.0, 0.85, 5.7, 2.0, { fontSize: 120, bold: true, color: C.white, valign: "middle" });
    txt(s, "chain files in its database", 7.0, 2.85, 5.7, 0.9, { fontSize: 22, color: C.dim });
    // exactly 464 squares: 29 x 16, one gold
    const cols = 29, rows = 16, sq = 0.115, pitch = 0.16, gx = M, gy = 4.0;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const isGold = (r === 6 && c === 9) || (r === 9 && c === 18); const col = isGold ? C.gold : C.grid;
      s.addShape(pres.shapes.RECTANGLE, { x: gx + c * pitch, y: gy + r * pitch, w: sq, h: sq, fill: { color: col }, line: { color: col, width: 0 } }); }
    txt(s, "464 coordinate systems, two of which hold almost everything we know", M, 6.7, 5.9, 0.5, { fontSize: 15, color: C.dim });
    txt(s, "Almost everything we know about the human genome is written in hg38 or CHM13.", 7.0, 4.1, 5.7, 1.4, { fontSize: 22, color: C.white });
    txt(s, "You can look at the other 462. You can't ask them anything.", 7.0, 5.6, 5.7, 1.0, { fontSize: 22, italic: true, color: C.gold });
    notes(s, `[0:15-1:00]
The UCSC Genome Browser can open 464 HPRC haplotype assemblies. The same database has 56 chain files.
(pause: two full beats, let them do the arithmetic)
Which means almost everything we know about the human genome is written in hg38 or CHM13, and for the other 462 there is no way to move any of it across. You can look at them. You can't ask them anything. That's this talk.`); }

  // ============ 3. TWO TOOLS ============
  { const s = light("Two old tools. Both are single-pair.");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, T, cw, 4.55); circleIcon(s, ic.FaSearch, M + 0.35, T + 0.35, 0.7);
    txt(s, "Alignment (BLAT)", M + 1.25, T + 0.42, cw - 1.6, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["One assembly at a time. There are 464 now.", "The graph itself can be queried, from a shell: vg giraffe, the r-index, odgi.", "Nothing answers \"who carries this?\" from a browser search box."], M + 0.35, T + 1.35, cw - 0.7, 3.0);
    const x2 = M + cw + 0.4; card(s, x2, T, cw, 4.55); circleIcon(s, ic.FaRandom, x2 + 0.35, T + 0.35, 0.7);
    txt(s, "Lift-over (chain files)", x2 + 1.25, T + 0.42, cw - 1.6, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["A chain covers one ordered pair. 464 assemblies is more than 200,000 pairs.", "Chains in the browser database today: 56.", "halLiftover on the Cactus alignment does any pair, offline, at file scale."], x2 + 0.35, T + 1.35, cw - 0.7, 3.0);
    takeaway(s, "What hasn't existed: any pair, at web latency, inside the tool everyone already uses.");
    notes(s, `[1:00-1:50]
For thirty years two tools have moved knowledge between genomes: alignment and lift-over. Neither is broken. Both are single-pair.
(point left) BLAT runs against one assembly. There are 464 now.
(point right) A chain covers one ordered pair. Two hundred thousand possible pairs; the browser has fifty-six.
And yes, this room can already query the graph: giraffe, the r-index, odgi, halLiftover on the Cactus alignment. From a shell, in seconds to minutes, by people who write shell.
What has not existed is that capability at web latency, for any pair, inside the tool everyone else uses. In the browser, the graph has been a file, not a tool.`); }

  // ============ 4. TWO USERS ============
  const U = [["FaSearch", "Story 1", "A sequence GRCh38 doesn't have", "A researcher assembles an insertion from long reads. It isn't in the reference. Which HPRC haplotypes carry it, and what does it look like there?", "BLAT: one assembly at a time, blind to the graph"],
    ["FaRandom", "Story 2", "A gene you know, on a genome you don't", "The same researcher is curating a gene on GRCh38, ClinVar and GWAS open, and wants to see it on one HPRC individual.", "QuickLift: only where a chain already exists"]];
  const cw2 = (W - 2 * M - 0.4) / 2;
  { const s = light("Two users the browser can't serve today");
    U.forEach(([i, tag, a, b, today], k) => { const x = M + k * (cw2 + 0.4), y = T, h = 4.5; card(s, x, y, cw2, h);
      circleIcon(s, ic[i], x + 0.35, y + 0.4, 0.85);
      txt(s, tag, x + 1.4, y + 0.42, cw2 - 1.8, 0.35, { fontSize: 14, bold: true, color: C.muted, charSpacing: 2 });
      txt(s, a, x + 1.4, y + 0.75, cw2 - 1.8, 0.5, { fontSize: 22, bold: true, color: C.navy });
      txt(s, b, x + 0.35, y + 1.6, cw2 - 0.7, 1.4, { fontSize: 19 });
      txt(s, "today", x + 0.35, y + 3.2, cw2 - 0.7, 0.35, { fontSize: 16, color: C.muted });
      txt(s, today, x + 0.35, y + 3.55, cw2 - 0.7, 0.7, { fontSize: 24, bold: true, color: C.coral, valign: "middle" }); });
    takeaway(s, "By the end of this talk: both, in the browser, in seconds.");
    notes(s, `[1:50-2:35]
Let me make this concrete with one researcher and two afternoons.
First afternoon: she has assembled an insertion from a patient's long reads, and it is not in GRCh38. Which HPRC haplotypes carry it? How common is it? What does the neighbourhood look like on a genome that actually has it? Today her tool is BLAT: one assembly at a time, and BLAT knows nothing about the graph, so it can't tell her who else carries the sequence.
Second afternoon: she's curating a gene on GRCh38, ClinVar and the GWAS catalog open, and she wants to see that locus on one HPRC individual. Today her tool is QuickLift, and QuickLift works only where a chain already exists. For most HPRC haplotypes, it doesn't.
Everyone in this room can serve her with enough shell. Nobody can do it from the browser, in seconds, for an arbitrary haplotype. By the end of this talk: both afternoons, live.`); }

  // ============ 5. ARCHITECTURE ============
  { const s = light("One service, two engines, three pages");
    const lx = M, lw = 7.9;
    card(s, lx, T, lw, 1.35, C.card); txt(s, "UCSC Genome Browser", lx + 0.3, T + 0.12, 5, 0.4, { fontSize: 18, bold: true, color: C.navy });
    ["Pangenome Mapping", "Convert Coordinates", "hgConvert"].forEach((t, i) => { const cx = lx + 0.3 + i * 2.45;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: T + 0.62, w: 2.3, h: 0.55, fill: { color: C.white }, line: { color: C.cardLine, width: 1 }, rectRadius: 0.08 });
      txt(s, t, cx, T + 0.62, 2.3, 0.55, { fontSize: 16, align: "center", valign: "middle" }); });
    s.addShape(pres.shapes.LINE, { x: lx + lw / 2, y: T + 1.35, w: 0, h: 0.5, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
    txt(s, "JSON over HTTP", lx + lw / 2 + 0.15, T + 1.42, 3, 0.4, { fontSize: 16, color: C.muted });
    card(s, lx, T + 1.85, lw, 0.75, C.card); txt(s, "pangenome service", lx, T + 1.85, lw, 0.75, { fontSize: 18, bold: true, color: C.navy, align: "center", valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: lx + 1.95, y: T + 2.6, w: 0, h: 0.45, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
    s.addShape(pres.shapes.LINE, { x: lx + lw - 1.95, y: T + 2.6, w: 0, h: 0.45, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
    card(s, lx, T + 3.05, 3.8, 1.2); card(s, lx + lw - 3.8, T + 3.05, 3.8, 1.2);
    txt(s, "vg giraffe", lx + 0.3, T + 3.15, 3.3, 0.4, { fontSize: 18, bold: true, color: C.navy }); txt(s, "maps a sequence to the whole graph", lx + 0.3, T + 3.57, 3.3, 0.6, { fontSize: 16, color: C.muted });
    txt(s, "pangenome-index", lx + lw - 3.5, T + 3.15, 3.3, 0.4, { fontSize: 18, bold: true, color: C.navy }); txt(s, "tag arrays: any-to-any translation", lx + lw - 3.5, T + 3.57, 3.3, 0.6, { fontSize: 16, color: C.muted });
    card(s, lx, T + 4.55, lw, 0.8, C.navy, C.navy); txt(s, "HPRC v2.0 Minigraph-Cactus graph  •  464 haplotypes, CHM13 and GRCh38 included  •  148M nodes", lx, T + 4.55, lw, 0.8, { fontSize: 16, color: C.white, align: "center", valign: "middle" });
    const rx = M + lw + 0.6, rw = W - M - rx;
    [["FaSearch", "Search"], ["FaRandom", "Translate"], ["FaLayerGroup", "Lift annotations"]].forEach(([i, t], k) => { const y = T + 0.2 + k * 1.55; circleIcon(s, ic[i], rx, y, 0.85); txt(s, t, rx + 1.1, y, rw - 1.1, 0.85, { fontSize: 22, bold: true, color: C.navy, valign: "middle" }); });
    txt(s, "Core browser changes: 3 files, 15 lines.", rx, T + 4.85, rw, 0.5, { fontSize: 16, italic: true, color: C.muted });
    notes(s, `[2:30-3:15]
Here's what we built to answer all three, and it fits on one slide. The browser talks to a service. The service holds two engines over the HPRC v2 graph: vg giraffe for mapping sequences, and our coordinate-translation index. Three pages in the browser, three things they do: search, translate, lift annotations.
Fifteen lines changed in the browser's core; everything else is a new page. Let me start with the one idea that makes translation possible at all.`); }

  // ============ 6a. INDEXING DILEMMA ============
  { const s = light("Indexing a pangenome forced a trade-off"); qtag(s, "Tag arrays");
    const cw = (W - 2 * M - 0.8) / 3;
    [["FM-index on the haplotypes", "Simple and lossless, but the same seed is reported once per haplotype: 464 copies of every hit.", "ropebwt3"],
     ["FM-index on the graph", "Deduplicated positions, but construction needs graph transformations that are fragile and can drop parts of haplotypes.", "HISAT2, vg map"],
     ["Minimizer indexes", "Fast, but the seed length is fixed in advance: a permanent trade of sensitivity for specificity.", "vg giraffe"]].forEach(([a, b, c], i) => {
      const x = M + i * (cw + 0.4); card(s, x, T, cw, 3.7);
      txt(s, a, x + 0.35, T + 0.35, cw - 0.7, 0.9, { fontSize: 21, bold: true, color: C.navy });
      txt(s, b, x + 0.35, T + 1.35, cw - 0.7, 1.7, { fontSize: 16 });
      txt(s, c, x + 0.35, T + 3.1, cw - 0.7, 0.4, { fontSize: 14, color: C.muted }); });
    card(s, M, T + 4.05, W - 2 * M, 1.05, C.navydeep, C.navydeep);
    txt(s, "Tag arrays: keep the FM-index on the haplotypes, annotate the BWT with graph positions. Lossless, deduplicated, any seed length.", M + 0.4, T + 4.05, W - 2 * M - 0.8, 1.05, { fontSize: 19, bold: true, color: C.white, align: "center", valign: "middle" });
    notes(s, `[3:15-3:50]
A brief word on the index, because everything rests on it.
Indexing a pangenome used to force a choice. An FM-index on the haplotype sequences is simple and lossless, but reports the same seed once per haplotype. An FM-index on the graph deduplicates, but needs graph transformations that are fragile and can lose parts of haplotypes. Minimizer indexes are fast, but the seed length is fixed in advance.
Tag arrays take a different route: keep the FM-index on the haplotypes, and annotate the BWT with graph positions. Lossless, deduplicated, any seed length.`); }

  // ============ 6b. TAG ARRAYS ============
  { const s = light("Tag arrays: every BWT position knows its node"); qtag(s, "Tag arrays");
    const iw = 7.7; s.addImage({ path: path.join(FIG, "own/tag2_0.png"), x: M, y: T + 0.15, w: iw, h: iw * 1284 / 1930 });
    const rx = M + iw + 0.5, rw = W - M - rx;
    [["Query", "The r-index finds the BWT interval for a pattern; two rank queries on the run-length tag structure return the distinct graph positions in it. No scan, no redundancy."],
     ["Runs, not positions", "Similar suffixes sit together, so tags come in long runs. Bases grew 5x from v1.1 to v2.0; tag runs only 2x."],
     ["Built at HPRC scale", "Per chromosome, merged through the multi-string BWT. v2.0: 464 haplotypes, 2.6 Tbp, 26 billion tag runs, 149 GiB; a 23 GiB sampled tag array serves translation."]]
      .forEach(([a, b], k) => { const y = T + 0.15 + k * 1.6; txt(s, a, rx, y, rw, 0.4, { fontSize: 18, bold: true, color: C.navy }); txt(s, b, rx, y + 0.42, rw, 1.2, { fontSize: 15 }); });
    card(s, rx, T + 4.95, rw, 0.6, C.card); txt(s, "No pairwise index anywhere.", rx, T + 4.95, rw, 0.6, { fontSize: 16, bold: true, color: C.navy, align: "center", valign: "middle" });
    txt(s, "Eskandar, Paten, Sirén. Lossless pangenome indexing using tag arrays. WABI 2025; Algorithms for Molecular Biology 2026.", M, 6.8, W - 2 * M, 0.4, { fontSize: 13, color: C.muted, align: "center" });
    notes(s, `[3:50-4:50]
Here is the whole idea on a toy graph. Three haplotypes, one BWT over their sequences. The tag array runs alongside the BWT: for every BWT position, the graph node and offset it came from.
A query is two steps. The r-index finds the BWT interval for a pattern, exactly as an FM-index would. Then two rank queries on the run-length tag structure return the distinct graph positions in that interval. No scan, no decompression, no redundancy: one hit per graph position, however many haplotypes share it.
It stays small because similar suffixes sit together, so tags come in long runs: from v1.1 to v2.0 the sequence grew fivefold and the tag runs only doubled. We build it per chromosome and merge through the multi-string BWT. For release 2: 464 haplotypes, 2.6 terabases, 26 billion tag runs, 149 gigabytes, plus a 23 gigabyte sampled tag array that serves coordinate translation.
Notice what's missing: nothing anywhere says CHM13-to-HG02015. That is what makes any-to-any translation possible.`); }

  // ============ 7. TRANSLATION ============
  { const s = light("Translating a region is a walk, not a lookup");
    const iw = 7.6, ih = iw * 1715 / 2691; s.addImage({ path: path.join(FIG, "translation.png"), x: M, y: T + 0.1, w: iw, h: ih });
    const rx = M + iw + 0.4, rw = W - M - rx;
    ["Find the query's nodes on the source path.", "Ask the tag arrays who else is here.", "Nodes both visit exactly once: unambiguous anchors.", "Walk between anchors, base by base; group shared offsets into chain blocks."]
      .forEach((t, i) => { const y = T + 0.15 + i * 1.2; chip(s, String(i + 1), rx, y); txt(s, t, rx + 0.65, y - 0.02, rw - 0.65, 1.1, { fontSize: 17 }); });
    takeaway(s, "The output is a chain. Orthology is the graph's. Missing positions are possible; a repeat cannot manufacture a wrong one.");
    notes(s, `[4:50-6:10]
With that one property in hand, translating a region stops being a lookup and becomes a walk.
(1) Find the query interval's nodes on the source haplotype's path.
(2) At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once.
(3) Nodes that source and target each visit exactly once are unambiguous anchors. Orthology is inherited from the graph's alignment. What we guarantee is that a repeat can't manufacture a false anchor, and a colinearity check drops pairs whose spans disagree.
(4) Walk the graph between anchors, one base at a time, and group the bases that share an offset into blocks. A block breaks on an indel, never on a SNP; an inversion starts a new chain. That is exactly what a chain file means.
So the output isn't a coordinate. It is a chain, and the browser already knows what to do with a chain. And if the target simply doesn't contain the interval, you get fewer positions, never invented ones.`); }

  // ============ 8a. SCENARIO 1: RECORDING ============
  { const s = light("Story 1: a sequence GRCh38 doesn't have"); qtag(s, "Story 1");
    const vw = 8.5, vh = vw * 9 / 16; video(s, "scenario1.mp4", M, T, vw, vh, "Screen recording: Pangenome Mapping");
    const rx = M + vw + 0.45, rw = W - M - rx;
    ["She pastes the insertion into Pangenome Mapping; vg giraffe maps it once, to the whole graph.", "Every haplotype that carries it comes back, ranked by identity: two of 464, and GRCh38 is not one of them.", "She clicks a carrier and lands in the browser with her sequence drawn as a track."]
      .forEach((t, i) => { const y = T + 0.1 + i * 1.5; chip(s, String(i + 1), rx, y); txt(s, t, rx + 0.65, y - 0.02, rw - 0.65, 1.4, { fontSize: 16 }); });
    notes(s, `[6:10-7:30]  Start the recording; narrate over it.
First afternoon: the insertion that isn't in the reference. This is the Pangenome Mapping page, BLAT for the pangenome.
She pastes the insertion. It is mapped once, to the whole graph, with vg giraffe, in a few seconds. And here is what BLAT could never have told her: exactly two of the 464 haplotypes carry this sequence, HG01167 hap1 and HG04157 paternal, and GRCh38 is not one of them. Ranked by identity, with coverage beside it.
She clicks HG01167. No special page: she lands in the browser, on a genome that actually has her insertion, with the sequence as a native track, base-level differences colored the way BLAT users already know, and that haplotype's own annotation around it. Picking a different carrier re-surjects the same alignment; nothing is remapped.`); }

  // ============ 8b. SCENARIO 1: WHAT IT SOLVES ============
  { const s = light("What that changes on release 2"); qtag(s, "Story 1");
    const fr = browser(s, ["crop_mapping_result.png"], M, T, W - 2 * M, 3.7);
    const cw = (W - 2 * M - 0.8) / 3;
    ["One search, every carrying haplotype, ranked. BLAT: one assembly at a time.", "Sequences absent from the reference are found where they live.", "Land on any carrier as a track; re-surject without remapping."]
      .forEach((t, i) => { const x = M + i * (cw + 0.4), y = fr.bottom + 0.3; chip(s, String(i + 1), x, y); txt(s, t, x + 0.65, y - 0.02, cw - 0.65, 0.9, { fontSize: 17 }); });
    txt(s, "MAPQ is 0 by design: every locus exists hundreds of times in this graph. Per-haplotype identity and coverage replace it.", M, 6.85, W - 2 * M, 0.4, { fontSize: 14, color: C.muted, align: "center" });
    notes(s, `[7:30-8:05]
So what does that change on release 2? Before, BLAT ran against one assembly at a time, with 464 to choose from and no way to know which; a sequence missing from hg38 was simply unmapped; nothing told you who else carried it. Now one search against the whole graph returns every carrying haplotype, ranked; sequences absent from the reference are found where they actually live; you land on any carrier as a native track, and re-surjecting to another haplotype costs nothing.
One detail this room will notice: MAPQ is zero by design. In a graph where every locus exists hundreds of times, mapping quality carries no information; per-haplotype identity and coverage replace it.`); }

  // ============ 10. STORY 2, TODAY: QUICKLIFT ============
  { const s = light("Story 2, today: QuickLift needs a chain per pair"); qtag(s, "Story 2");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, T, cw, 4.6); circleIcon(s, ic.FaLayerGroup, M + 0.35, T + 0.35, 0.7);
    txt(s, "QuickLift, in the browser since 2025", M + 1.25, T + 0.42, cw - 1.6, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["View > In Other Genomes, tick \"QuickLift tracks\": your tracks are drawn on the other assembly, differences marked with vertical bars.",
      "Needs a prebuilt liftOver chain between the two assemblies, made by UCSC on request.",
      "Superb for hg38 to hs1. Between HPRC haplotypes: 56 chains, out of 200,000+ pairs."], M + 0.35, T + 1.3, cw - 0.7, 3.2, { fontSize: 17 });
    const x2 = M + cw + 0.4; card(s, x2, T, cw, 4.6);
    const gw = cw - 0.7, gh = gw * 982 / 2783; s.addImage({ path: path.join(FIG, "grids.png"), x: x2 + 0.35, y: T + 0.55, w: gw, h: gh });
    txt(s, "She picks HG02015 from the menu. There is no chain. Dead end.", x2 + 0.35, T + 0.75 + gh, gw, 1.2, { fontSize: 19, italic: true, color: C.navy, align: "center" });
    takeaway(s, "The renderer is ready. The missing piece is a chain for any pair, on demand.");
    notes(s, `[8:05-8:40]
Second afternoon. She has HLA-DMA open on a reference, ClinVar and GWAS beside it, and she wants that locus on one HPRC individual.
The browser already has the right tool for this: QuickLift, shipped last year. View, In Other Genomes, tick QuickLift tracks, and your tracks are drawn on the other assembly with the differences marked. It is superb for hg38 to hs1.
But QuickLift needs a prebuilt chain between the two assemblies, made by UCSC on request. Between HPRC haplotypes the browser has fifty-six, out of more than two hundred thousand pairs. She picks HG02015. There is no chain. Dead end.
The renderer is ready. What's missing is a chain for any pair, on demand. That is exactly what the walk from slide seven produces.`); }

  // ============ 11. SCENARIO 2: RECORDING ============
  { const s = light("Story 2: the gene she knows, on HG02015"); qtag(s, "Story 2");
    const vw = 8.5, vh = vw * 9 / 16; video(s, "scenario2.mp4", M, T, vw, vh, "Screen recording: Convert Coordinates, then land with annotations");
    const rx = M + vw + 0.45, rw = W - M - rx;
    ["Source: the gene's coordinates on the reference she was using; target: HG02015 paternal, picked from all 464.", "Translated in about 100 ms, 100% of bases.", "She clicks through: the reference's tracks are drawn on HG02015, with insertions, deletions and mismatches marked."]
      .forEach((t, i) => { const y = T + 0.1 + i * 1.5; chip(s, String(i + 1), rx, y); txt(s, t, rx + 0.65, y - 0.02, rw - 0.65, 1.4, { fontSize: 16 }); });
    notes(s, `[8:40-10:20]  Start the recording; slow down at the landing.
Now the same afternoon with our tool. Source: the gene she was looking at, here HLA-DMA on CHM13, ten kilobases on chromosome 6; GRCh38 is a path in this graph too, so hg38 works exactly the same way. Target: HG02015 paternal, the haplotype that was a dead end a minute ago; the picker can show only haplotypes that contain the region.
Translated in about a hundred milliseconds. A hundred percent of bases.
She clicks the result, and this is the part I care about most. HG02015 has its own CAT and Liftoff genes from release 2. What it will never have is everything that exists once, on one reference: ClinVar, the GWAS catalog, ENCODE, her own BED file. And here they are, drawn at their translated positions, with the differences marked the way QuickLift users already read them.
(pause) The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain; the browser's own QuickLift renderer drew the tracks. Same QuickLift. The chain just isn't prebuilt anymore.`); }

  // ============ 12. PAYOFF ============
  { const s = light("What that changes on release 2"); qtag(s, "Story 2");
    const fr = browser(s, ["crop_lifted.png"], M, T, W - 2 * M);
    s.addText([{ text: "Before: ", options: { bold: true, color: C.muted } }, { text: "lift-over only between pairs with a prebuilt chain, 56 of 200,000+; a haplotype without one showed only its own tracks.", options: { color: C.muted, breakLine: true } },
      { text: "Now: ", options: { bold: true, color: C.navy } }, { text: "any of 464 haplotypes as the target, from hg38 or CHM13, in ~100 ms; the reference's tracks come along over a chain built for this page view, with an Alignment Differences track; also in the ordinary hgConvert menu.", options: { color: C.ink } }],
      { x: M, y: fr.bottom + 0.15, w: W - 2 * M, h: 1.15, fontFace: FONT, fontSize: 16, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 4 });
    txt(s, "translation blocks  →  bigChain  →  QuickLift draws them   •   Alignment Differences marks insertions, deletions and mismatches", M, 6.85, W - 2 * M, 0.4, { fontSize: 15, color: C.muted, align: "center" });
    notes(s, `[10:20-10:55]
Before: lift-over only between pairs with a prebuilt chain, fifty-six of two hundred thousand, new ones made on request, and a haplotype without a chain showed only its own tracks. Now: any of the 464 haplotypes as the target, from hg38 or CHM13, in about a hundred milliseconds; the chain is built for the region you're looking at and reused as you pan; the reference's tracks come along with the differences marked; and it's in the ordinary hgConvert menu too.
That is what I mean by making release 2 useful: the thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. Any haplotype can borrow them, on demand.`); }

  // ============ 12b. WHO THIS IS FOR ============
  { const s = light("Who this is for");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, T, cw, 4.6); circleIcon(s, ic.FaUserMd, M + 0.35, T + 0.35, 0.7); txt(s, "Clinicians and variant curators", M + 1.25, T + 0.42, cw - 1.6, 0.55, { fontSize: 21, bold: true, color: C.navy });
    bullets(s, ["Is this insertion or SV sequence private to my patient, or carried by HPRC individuals? Which ones?", "ClinVar and GWAS context on the haplotype that actually carries the patient's allele.", "Loci where one reference misleads: HLA, KIR, CYP2D6, LPA, SMN1/2, seen on many haplotypes with the reference annotation drawn there."], M + 0.35, T + 1.25, cw - 0.7, 3.2, { fontSize: 16 });
    const x2 = M + cw + 0.4; card(s, x2, T, cw, 4.6); circleIcon(s, ic.FaFlask, x2 + 0.35, T + 0.35, 0.7); txt(s, "Researchers and graph builders", x2 + 1.25, T + 0.42, cw - 1.6, 0.55, { fontSize: 21, bold: true, color: C.navy });
    bullets(s, ["Place contigs, probes, primers or guide RNAs on every haplotype at once; see which haplotypes lack the site.", "Move any reference annotation, or your own tracks, onto any assembly; compare a locus across individuals.", "Inspect the graph's alignment itself: the Alignment Differences track is the graph, drawn base by base."], x2 + 0.35, T + 1.25, cw - 0.7, 3.2, { fontSize: 16 });
    takeaway(s, "No pipeline, no download: a browser tab, and a sequence or a position.");
    notes(s, `[10:55-11:35]
Who is this for? For clinicians and curators: is this insertion private to my patient, or carried by HPRC individuals, and which ones? ClinVar and GWAS context on the haplotype that actually carries the patient's allele. And the complex loci where one reference misleads: HLA, KIR, CYP2D6, LPA, SMN, seen on many haplotypes with the reference annotation drawn there.
For researchers and graph builders: place contigs, probes, primers or guide RNAs on every haplotype at once; move any annotation, including your own tracks, onto any assembly; and inspect the graph's alignment itself, because the Alignment Differences track is the graph, drawn base by base.
No pipeline, no download. A browser tab, and a sequence or a position.`); }

  // ============ 13. VALIDATION ============
  { const s = light("What we have checked, and what we haven't");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, T, cw, 4.65); circleIcon(s, ic.FaCheck, M + 0.35, T + 0.35, 0.65, C.teal); txt(s, "Checked", M + 1.2, T + 0.4, cw - 1.5, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["Alignment Differences, base by base: 22 kb of ABO, hs1 vs HG00597#1, exactly the 2 real mismatches.",
      "Chains round-trip cleanly through bigChainToChain; blocks follow chain-file semantics.",
      "Completeness by span: 99% up to 10 kb, 97% at 100 kb, 93% at 1 Mb.",
      "Hard case: a 37 kb segdup-dense span on 1q21.1 recovers 46% of bases. Missing positions, not wrong ones: a repeat cannot manufacture an anchor."], M + 0.35, T + 1.2, cw - 0.7, 3.4, { fontSize: 16 });
    const x2 = M + cw + 0.4; card(s, x2, T, cw, 4.65); circleIcon(s, ic.FaExclamation, x2 + 0.35, T + 0.35, 0.65, C.coral); txt(s, "Not yet", x2 + 1.2, T + 0.4, cw - 1.5, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["A systematic comparison with halLiftover on the same Cactus alignment.",
      "Agreement with the 56 chains that already exist in the browser.",
      "CHM13 CAT transcripts lifted onto a haplotype that has its own CAT annotation: do exon boundaries agree?"], x2 + 0.35, T + 1.2, cw - 0.7, 3.4, { fontSize: 16 });
    takeaway(s, "Those three numbers come before public release.");
    notes(s, `[11:35-12:20]
Before the numbers on speed, the numbers on trust, and which ones I actually have.
Checked: the Alignment Differences track, base by base, across 22 kb of ABO: exactly the two real mismatches, nothing invented. A correctness check, not a divergence estimate. Completeness by span: 99% at gene scale, 93% at a megabase. And one hard case: a segdup-dense span on 1q21.1 recovers about half its bases. Missing positions, not wrong ones: a repeat cannot manufacture an anchor.
Not yet: halLiftover on the same Cactus alignment, agreement with the 56 existing chains, and the one I care about most, CHM13's CAT transcripts onto a haplotype that has its own CAT annotation, exon boundary by exon boundary. Those three come before public release.`); }

  // ============ 14. FAST ENOUGH ============
  { const s = light("Fast enough to sit behind a web page");
    // lollipop on a log axis (native shapes)
    txt(s, "Translation latency, median (log scale)", M, T, 6.0, 0.4, { fontSize: 18, bold: true, color: C.navy });
    const rowsL = [["up to 1 kb", 21, "~20 ms"], ["10 kb", 115, "115 ms"], ["100 kb", 599, "0.6 s"], ["1 Mb", 4300, "4.3 s"]];
    const ax0 = 2.35, axW = 3.7, y0 = T + 1.05, pitch = 0.85; const xv = v => ax0 + (Math.log10(v) - 1) * axW / 3;
    [10, 100, 1000, 10000].forEach((d, i) => { const x = xv(d); s.addShape(pres.shapes.LINE, { x, y: y0 - 0.35, w: 0, h: pitch * 3 + 0.7, line: { color: C.hair, width: 1, dashType: "dash" } });
      txt(s, ["10 ms", "100 ms", "1 s", "10 s"][i], x - 0.5, y0 + pitch * 3 + 0.45, 1.0, 0.35, { fontSize: 14, color: C.muted, align: "center" }); });
    rowsL.forEach(([lab, v, vl], i) => { const y = y0 + i * pitch, x = xv(v);
      txt(s, lab, M, y - 0.2, 1.55, 0.4, { fontSize: 16, color: C.ink, align: "right", valign: "middle" });
      s.addShape(pres.shapes.LINE, { x: ax0, y, w: x - ax0, h: 0, line: { color: C.stem, width: 3 } });
      s.addShape(pres.shapes.OVAL, { x: x - 0.11, y: y - 0.11, w: 0.22, h: 0.22, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
      txt(s, vl, x + 0.2, y - 0.2, 1.4, 0.4, { fontSize: 18, bold: true, color: C.navy, valign: "middle" }); });
    s.addChart(pres.charts.LINE, [{ name: "queries / s", labels: ["1", "2", "4", "8", "16", "32"], values: [6.3, 13.2, 23.6, 60.3, 59.4, 65.3] }],
      { x: 6.9, y: T, w: W - M - 6.9, h: 4.35, chartColors: [C.navy], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 9, fontFace: FONT,
        showTitle: true, title: "Concurrent 3.4 kb queries per second", titleColor: C.navy, titleFontSize: 18, titleFontFace: FONT,
        catAxisLabelColor: C.ink, valAxisLabelColor: C.ink, catAxisLabelFontSize: 16, valAxisLabelFontSize: 16, valGridLine: { color: C.hair, size: 0.5 }, catGridLine: { style: "none" },
        showLegend: false, showValue: true, dataLabelPosition: "t", dataLabelFormatCode: "0", dataLabelFontSize: 16, dataLabelColor: C.navy, dataLabelFontFace: FONT,
        valAxisMinVal: 0, valAxisMaxVal: 80, valAxisMajorUnit: 20, catAxisTitle: "threads", showCatAxisTitle: true, catAxisTitleColor: C.muted, catAxisTitleFontSize: 14 });
    txt(s, "Single-thread run was warm-up-limited; read the plateau: about 60 queries per second per server.", 6.9, T + 4.4, W - M - 6.9, 0.4, { fontSize: 14, color: C.muted, align: "center" });
    takeaway(s, "Exon-scale in 20 ms, a 10 kb gene in a tenth of a second, a megabase in four. One server sustains about 60 queries a second.", 6.35);
    notes(s, `[12:20-13:05]
None of this matters if it takes a minute. So: is it fast enough to sit behind a web page?
Exon-scale intervals translate in about twenty milliseconds, a ten-kilobase gene in about a tenth of a second, a hundred kilobases in under a second, a megabase in about four.
And it serves many people at once: throughput goes from six to sixty queries a second and saturates around eight cores. Read that as "one box serves about sixty queries a second", not as perfect scaling; the single-thread number was warm-up-limited.`); }

  // ============ 15. LIMITS + NEXT ============
  { const s = light("Real limits, and what's next");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, T, cw, 3.55); txt(s, "Today", M + 0.35, T + 0.3, cw - 0.7, 0.5, { fontSize: 22, bold: true, color: C.muted });
    bullets(s, ["Chains are built per view. Pan far enough and another one is built.", "Segdup-dense spans lose positions: 46% recovered on 1q21.1.", "Development browser only. One service, about 250 GB of RAM. No public API yet."], M + 0.35, T + 0.95, cw - 0.7, 2.5, { fontSize: 17 });
    const x2 = M + cw + 0.4; card(s, x2, T, cw, 3.55); txt(s, "Next", x2 + 0.35, T + 0.3, cw - 0.7, 0.5, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["Shared, persistent chains: popular regions free after the first visit.", "Better recovery in segdup-dense spans.", "A documented JSON API, so it runs from your pipeline too.", "New graphs plug in by building one index."], x2 + 0.35, T + 0.95, cw - 0.7, 2.5, { fontSize: 17 });
    card(s, M, T + 3.95, W - 2 * M, 1.05, C.navydeep, C.navydeep);
    s.addText([{ text: "Next milestone: ", options: { color: C.dim } }, { text: "public release in the UCSC Genome Browser", options: { color: C.white, bold: true } }],
      { x: M, y: T + 3.95, w: W - 2 * M, h: 1.05, fontFace: FONT, fontSize: 24, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    notes(s, `[13:05-14:00]
Two things I want to be honest about before I stop.
Chains are built per view, so if you pan far enough we build another one. And wide, segdup-dense spans lose positions: on 1q21.1 we recover about half. Missing, not wrong. This runs on the development browser, as one service with about 250 gigabytes of RAM, and there is no public API yet.
What's next. Chains that persist: right now a widened chain dies with your session; share it across users and popular regions are free after the first visit. Better recovery in segdups. A documented JSON API, because half of you will want this from a pipeline, not a browser. And more graphs: nothing here is specific to release 2; a new release plugs in by building one index.
And the milestone all of that serves: the public UCSC Genome Browser.`); }

  // ============ 16. VISION (rhymes with slide 4) ============
  { const s = dark();
    txt(s, "Both users, served", M, 0.42, W - 2 * M, 0.78, { fontSize: 32, bold: true, color: C.white, valign: "middle" });
    const done = ["two carriers found in seconds; her insertion mapped as a track on a genome that has it", "HG02015 in ~100 ms, with the reference's tracks drawn around the gene, over a chain built on the spot"];
    U.forEach(([i, tag, a, b], k) => { const x = M + k * (cw2 + 0.4), y = T, h = 4.5; card(s, x, y, cw2, h, C.cardDark, C.cardDarkLine);
      circleIcon(s, ic[i], x + 0.35, y + 0.4, 0.85, C.teal);
      txt(s, tag, x + 1.4, y + 0.42, cw2 - 1.8, 0.35, { fontSize: 14, bold: true, color: C.dim, charSpacing: 2 });
      txt(s, a, x + 1.4, y + 0.75, cw2 - 1.8, 0.5, { fontSize: 22, bold: true, color: C.white });
      txt(s, b, x + 0.35, y + 1.6, cw2 - 0.7, 1.4, { fontSize: 19, color: C.dim });
      txt(s, done[k], x + 0.35, y + 3.1, cw2 - 0.7, 0.5, { fontSize: 15, color: C.dim });
      txt(s, "done", x + 0.35, y + 3.55, cw2 - 0.7, 0.7, { fontSize: 40, bold: true, color: C.gold, valign: "middle" }); });
    txt(s, "Live on the development browser today. Bring me your hardest region, and tell me where it breaks.", M, 6.3, W - 2 * M, 0.6, { fontSize: 22, italic: true, color: C.gold, align: "center", valign: "middle" });
    notes(s, `[14:00-14:35]
So, back to her two afternoons.
The insertion that isn't in GRCh38: two carriers found in seconds, and mapped as a track on a genome that has it. The gene she knew on a reference: on HG02015 in a tenth of a second, with the reference's tracks drawn around it, over a chain that didn't exist until she asked.
It's live on the development browser today. So bring me your hardest region, and tell me where it breaks.
(Advance to the thanks slide, let it breathe, then take questions.)`); }

  // ============ 17. THANKS ============
  { const s = dark();
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.3, w: W, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    s.addImage({ path: path.join(FIG, "emblem2.png"), x: W - M - 5.5, y: 2.315 - 5.5 * 392 / 1678 / 2, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: M, y: 0.45, w: 1.4, h: 1.4 * 1540 / 1855 });
    txt(s, "Thank you", M, 2.7, 6, 0.7, { fontSize: 32, bold: true, color: C.white });
    txt(s, "seeskand@ucsc.edu", M, 3.6, 6.5, 0.5, { fontFace: "Courier New", fontSize: 22, color: C.gold });
    txt(s, "github.com/parsaeskandar/hprc_2026_poster", M, 4.1, 7, 0.45, { fontFace: "Courier New", fontSize: 17, color: C.gold });
    txt(s, "Poster, slides and figures are in the repository.", M, 4.6, 7, 0.4, { fontSize: 16, color: C.dim });
    s.addText([{ text: "Jouni Sirén  •  Benedict Paten", options: { color: C.white, fontSize: 18, breakLine: true } },
      { text: "UC Santa Cruz Computational Genomics Lab: Adam Novak, Glenn Hickey, Zia Truong, Mark Diekhans", options: { color: C.dim, fontSize: 16, breakLine: true } },
      { text: "The UCSC Genome Browser team  •  The Human Pangenome Reference Consortium", options: { color: C.dim, fontSize: 16, breakLine: true } },
      { text: "Built on vg and the HPRC v2.0 graph", options: { color: C.dim, fontSize: 16 } }],
      { x: M, y: 5.35, w: W - 2 * M, h: 1.7, fontFace: FONT, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 6 });
    notes(s, `[14:35-14:50]
None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you. Questions.`); }

  // ============ BACKUP ============
  { const s = dark(); s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: 3.35, w: 0.05, h: 0.75, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    txt(s, "Backup", 6.15, 3.3, 4, 0.85, { fontSize: 32, bold: true, color: C.white, valign: "middle" }); notes(s, "Backup slides for questions."); }
  { const s = light("Backup: translation on a toy graph"); qtag(s, "Tag arrays");
    const iw = 7.0; s.addImage({ path: path.join(FIG, "own/tag4_0.png"), x: M, y: T + 0.9, w: iw, h: iw * 402 / 1032 });
    txt(s, "source: orange, positions 3 to 7   •   target: purple", M, T + 0.9 + iw * 402 / 1032 + 0.2, iw, 0.4, { fontSize: 15, color: C.muted, align: "center" });
    const rx = M + iw + 0.6, rw = W - M - rx;
    ["Walk the source interval backwards with the r-index; collect the sampled tags it passes: nodes b, e, f.", "For each tag, the sampled tag array lists every haplotype at that graph position. Purple stands on b and f.", "Nodes both haplotypes visit exactly once anchor the two paths: b and f.", "Walk both paths between the anchors and emit offsets: orange 3 to purple 3, orange 6 to purple 6; orange 5 sits on node e, which purple never visits: no position, never a wrong one."]
      .forEach((t, i) => { const y = T + 0.05 + i * 1.2; chip(s, String(i + 1), rx, y + 0.02); txt(s, t, rx + 0.65, y, rw - 0.65, 1.15, { fontSize: 15.5 }); });
    notes(s, "Backup: the coordinate translation query on the toy graph from the paper, for questions about how tags become coordinates."); }
  { const s = light("Backup: anchors and blocks, precisely");
    const cw = (W - 2 * M - 0.4) / 2; card(s, M, T, cw, 4.3); card(s, M + cw + 0.4, T, cw, 4.3);
    txt(s, "Anchors", M + 0.35, T + 0.3, cw - 0.7, 0.5, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["A node visited exactly once by the source path and exactly once by the target path is an unambiguous anchor with respect to the graph's alignment: our procedure cannot create a false one; a paralogy collapsed in the graph still can.",
      "A colinearity gate rejects anchor pairs whose target span is wildly inconsistent with the source span.",
      "The failure mode in hard regions is missing positions, never wrong ones."], M + 0.35, T + 0.95, cw - 0.7, 3.2, { fontSize: 16 });
    txt(s, "Blocks and chains", M + cw + 0.75, T + 0.3, cw - 0.7, 0.5, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["An LF-walk between anchors emits a per-base correspondence.",
      "A block is a maximal run of constant offset: it breaks on indels, never on substitutions. Orientation flips and non-colinear jumps start a new chain.",
      "Blocks are 0-based, half-open, and become bigChain + bigLink files the browser's QuickLift draws directly."], M + cw + 0.75, T + 0.95, cw - 0.7, 3.2, { fontSize: 16 });
    notes(s, "Backup: for questions about accuracy in repeats, or how the output relates to chain files."); }
  { const s = light("Backup: chains that keep up with panning");
    bullets(s, ["The request is padded to 5x its span (250 kb to 1 Mb) before the chain is built, so a gene-sized view gets a ~1 Mb chain.",
      "As the page navigates, the server rebuilds the same chain at +/-5 Mb in the background (about 11 s, off the user's path). The browser reopens the chain file on every request, so the next pan picks it up with no reload.",
      "Lifted gene items visible 4 Mb from the conversion: 1 with the first chain, 31 with the widened one."], M, T + 0.1, 5.9, 4.8, { fontSize: 17 });
    s.addChart(pres.charts.BAR, [{ name: "first chain (1.1 Mb)", labels: ["in window", "400 kb", "2 Mb", "4 Mb"], values: [3, 129, 1, 1] },
      { name: "widened chain (10 Mb)", labels: ["in window", "400 kb", "2 Mb", "4 Mb"], values: [3, 129, 5, 31] }],
      { x: 6.9, y: T, w: W - M - 6.9, h: 4.9, barDir: "col", chartColors: [C.gold, C.navy], fontFace: FONT, showLegend: true, legendPos: "t", legendFontSize: 14,
        showTitle: true, title: "Lifted gene items after panning away (log scale)", titleColor: C.navy, titleFontSize: 16, titleFontFace: FONT,
        valAxisLogScaleBase: 10, valAxisMinVal: 0.1, valAxisMaxVal: 1000, catAxisLabelColor: C.ink, valAxisLabelColor: C.ink, catAxisLabelFontSize: 14, valAxisLabelFontSize: 14,
        valGridLine: { color: C.hair, size: 0.5 }, catGridLine: { style: "none" }, showValue: false });
    notes(s, "Backup: how on-demand chains still let users pan and zoom."); }
  { const s = light("Backup: by the numbers");
    const items = [["148M", "nodes in the HPRC v2.0 Minigraph-Cactus graph", C.navy], ["464", "haplotypes indexed, CHM13 and GRCh38 included", C.navy],
      ["2.6 Tbp", "bidirectional sequence in the index", C.navy], ["26 B", "tag array runs (4.9 B BWT runs)", C.navy],
      ["149 GiB", "tag array index; 23 GiB sampled tag array", C.teal], ["~250 GB", "RAM for the running service", C.teal],
      ["15 lines", "changed in kent core, across 3 files", C.navy], ["385", "browser-side tests: payload validation, UI, hub writes", C.navy]];
    const cw = (W - 2 * M - 0.9) / 4, chh = 2.35;
    items.forEach(([a, b, col], i) => { const x = M + (i % 4) * (cw + 0.3), y = T + Math.floor(i / 4) * (chh + 0.35);
      card(s, x, y, cw, chh); txt(s, a, x, y + 0.35, cw, 0.8, { fontSize: 32, bold: true, color: col, align: "center", valign: "middle" });
      txt(s, b, x + 0.25, y + 1.25, cw - 0.5, 1.0, { fontSize: 16, color: C.muted, align: "center" }); });
    notes(s, "Backup: sizes and costs for questions about what it takes to run this."); }

  await pres.writeFile({ fileName: OUT }); console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
