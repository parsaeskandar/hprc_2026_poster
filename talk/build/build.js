// HPRC 2026 talk deck generator (pptxgenjs). v7: simple. Figures and screenshots carry the slides; the speaker carries the words.
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
  const ic = {}; for (const k of ["FaSearch", "FaRandom", "FaLayerGroup", "FaCheck", "FaExclamation", "FaRocket", "FaUserMd", "FaFlask", "FaTimes", "FaMapMarkerAlt", "FaPalette", "FaMagic"]) ic[k] = await icon(k, C.white);

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


  // Notes hold talking points only. Write your own sentences.
  const points = (s, items) => notes(s, "Talking points:\n" + items.map(t => "- " + t).join("\n"));

  // ============ 1. TITLE ============
  { const s = dark();
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.55, w: W, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    s.addImage({ path: path.join(FIG, "emblem.png"), x: W - M - 5.5, y: 2.565 - 5.5 * 392 / 1678 / 2, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: M, y: 0.45, w: 1.4, h: 1.4 * 1540 / 1855 });
    txt(s, "HPRC 2026", M, 2.05, 4, 0.35, { fontSize: 14, bold: true, color: C.gold, charSpacing: 3 });
    s.addText([{ text: "A pangenome sequence search and coordinate", options: { breakLine: true } }, { text: "translation service for the UCSC Genome Browser", options: {} }],
      { x: M, y: 2.85, w: 11.8, h: 1.7, fontFace: FONT, fontSize: 38, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "top" });
    txt(s, "Parsa Eskandar   •   Jouni Sirén   •   Benedict Paten", M, 6.05, 10, 0.45, { fontSize: 18, color: C.white });
    txt(s, "UC Santa Cruz Genomics Institute", M, 6.5, 10, 0.4, { fontSize: 16, color: C.dim });
    points(s, ["who you are, joint work with Jouni and the Genome Browser team"]); }

  // ============ 2. NOT POSSIBLE TODAY ============
  { const s = light("Not possible in the Genome Browser today");
    const lw = 6.2;
    [["Search a sequence across all 464 HPRC haplotypes", "today: BLAT, one assembly at a time"],
     ["Move a locus onto any HPRC haplotype", "today: only between the few assembly pairs with a prebuilt chain"],
     ["See the reference's annotation on an HPRC haplotype", "today: only for those same few pairs"]].forEach(([a, b], k) => {
      const y = T + 0.2 + k * 1.6; circleIcon(s, ic.FaTimes, M, y, 0.7, C.coral);
      txt(s, a, M + 0.95, y - 0.05, lw - 0.95, 0.85, { fontSize: 20, bold: true, color: C.navy });
      txt(s, b, M + 0.95, y + 0.78, lw - 0.95, 0.4, { fontSize: 15, color: C.muted }); });
    const gx = M + lw + 0.5, gw = W - M - gx, gh = gw * 982 / 2783;
    s.addImage({ path: path.join(FIG, "grids.png"), x: gx, y: T + 0.6, w: gw, h: gh });
    txt(s, "464 haplotypes make 200,000+ assembly pairs. Chains exist for 56 of them.", gx, T + 0.8 + gh, gw, 0.8, { fontSize: 15, color: C.muted, align: "center" });
    points(s, ["what a researcher cannot do here today", "no search across haplotypes: BLAT is one assembly at a time", "no lift-over to a haplotype without a prebuilt chain: 56 chains, 200,000+ pairs", "the graph aligns all 464 already; nothing in the browser uses it"]); }

  // ============ 3. TWO USE CASES ============
  { const s = light("Two use cases");
    const cw = (W - 2 * M - 0.4) / 2;
    [["FaSearch", "1", "Sequence search", "A sequence that is not in GRCh38.", "Which of the 464 haplotypes carry it?"],
     ["FaRandom", "2", "Coordinate translation", "A gene on GRCh38.", "Show it on HG02015, with its annotation."]].forEach(([i, nn, a, b, c], k) => {
      const x = M + k * (cw + 0.4); card(s, x, T + 0.3, cw, 3.9); circleIcon(s, ic[i], x + 0.35, T + 0.7, 0.85);
      chip(s, nn, x + cw - 0.85, T + 0.7, 0.5);
      txt(s, a, x + 0.35, T + 1.8, cw - 0.7, 0.6, { fontSize: 26, bold: true, color: C.navy });
      txt(s, b, x + 0.35, T + 2.55, cw - 0.7, 0.5, { fontSize: 19 });
      txt(s, c, x + 0.35, T + 3.05, cw - 0.7, 0.8, { fontSize: 19, color: C.navy }); });
    points(s, ["use case 1: a sequence not in the reference; which haplotypes carry it, and where", "use case 2: a locus known on GRCh38; see it on another haplotype with the annotation"]); }

  // ============ 4. USE CASE 1: DEMO ============
  { const s = light("Use case 1: sequence search"); qtag(s, "demo");
    const vh = 5.6, vw = vh * 16 / 9; video(s, "scenario1.mp4", (W - vw) / 2, T, vw, vh, "Screen recording: Pangenome Mapping");
    points(s, ["paste, map once to the whole graph", "results: which haplotypes, ranked by identity", "click one: the sequence as a track on that haplotype"]); }

  // ============ 5. USE CASE 1: RESULT ============
  { const s = light("Two of 464 haplotypes carry it"); qtag(s, "Use case 1");
    browser(s, ["crop_mapping_result.png", "crop_seqtrack.png"], M, T, W - 2 * M, 5.0);
    txt(s, "GRCh38 is not one of them.", M, 6.65, W - 2 * M, 0.5, { fontSize: 20, italic: true, color: C.navy, align: "center" });
    points(s, ["HG01167 hap1 and HG04157 paternal; not GRCh38", "one search instead of 464", "MAPQ is 0 by design in a graph this redundant; identity and coverage carry the ranking"]); }

  // ============ 6. USE CASE 2: DEMO ============
  { const s = light("Use case 2: coordinate translation"); qtag(s, "demo");
    const vh = 5.6, vw = vh * 16 / 9; video(s, "scenario2.mp4", (W - vw) / 2, T, vw, vh, "Screen recording: coordinate translation");
    points(s, ["source: the gene on the reference; target: HG02015 paternal, any of 464", "about 100 ms", "landing: reference tracks drawn on HG02015; differences marked"]); }

  // ============ 7. USE CASE 2: RESULT ============
  { const s = light("The reference's tracks, on HG02015"); qtag(s, "Use case 2");
    const fr = browser(s, ["crop_lifted.png"], M, T, W - 2 * M);
    txt(s, "No chain existed for this pair. The alignment was built for this region when the page loaded.", M, fr.bottom + 0.3, W - 2 * M, 0.6, { fontSize: 20, italic: true, color: C.navy, align: "center" });
    points(s, ["genes, ClinVar, your own tracks, drawn on a haplotype that had no chain", "Alignment Differences track: insertions, deletions, mismatches, base by base", "any of the 464 as the target"]); }

  // ============ 8. HOW: TAG ARRAYS ============
  { const s = light("How: one index over the whole graph"); qtag(s, "Tag arrays");
    const gh = 4.3, gw = gh * 1930 / 1284; s.addImage({ path: path.join(FIG, "own/tag2_0.png"), x: M, y: T + 0.05, w: gw, h: gh });
    const bw = gh * 735 / 1961, tw = gh * 422 / 1961, cx = M + gw + 0.6;
    s.addImage({ path: path.join(FIG, "bwt_col.png"), x: cx, y: T + 0.05, w: bw, h: gh });
    s.addImage({ path: path.join(FIG, "tags_col.png"), x: cx + bw + 0.15, y: T + 0.05, w: tw, h: gh });
    txt(s, "Every BWT position carries a tag: its node and offset in the graph.", M, T + 4.6, W - 2 * M, 0.5, { fontSize: 20, color: C.navy, align: "center" });
    txt(s, "Eskandar, Paten, Sirén. Lossless pangenome indexing using tag arrays. WABI 2025; Algorithms for Molecular Biology 2026.", M, 7.05, W - 2 * M, 0.32, { fontSize: 11, color: C.muted, align: "center" });
    points(s, ["one FM-index over all 464 haplotypes; a sequence is found once", "the tag: which node and offset each BWT position came from, so a match is a graph position", "from a node, every haplotype passing through it and where; that is what moves a locus", "no pairwise anything: any haplotype to any other"]); }

  // ============ 9-12. TRANSLATION, ONE STEP PER CLICK ============
  { const steps = ["Find the query's nodes on the source path.", "Ask the tag arrays who else is here.", "Nodes both visit exactly once: anchors.", "Walk between anchors; shared offsets become chain blocks."];
    const stepPoints = [["the query interval, projected onto the source haplotype's path"], ["at those nodes: every haplotype standing there, target included"],
      ["a node both paths visit exactly once cannot be a false anchor; orthology comes from the graph"], ["walk base by base; a block breaks on an indel, never a SNP; the output is a chain, and the browser knows chains", "missing positions are possible, invented ones are not"]];
    for (let k = 0; k < 4; k++) {
      const s = light("Translating a region"); qtag(s, `step ${k + 1} of 4`);
      const iw = 8.4, ih = iw * 1749 / 2691; s.addImage({ path: path.join(FIG, `translation_step${k + 1}.png`), x: M, y: T + 0.05, w: iw, h: ih });
      const rx = M + iw + 0.4, rw = W - M - rx;
      steps.forEach((t, i) => { if (i > k) return; const y = T + 0.3 + i * 1.25; const cur = i === k;
        if (cur) chip(s, String(i + 1), rx, y);
        else { s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y, w: 0.46, h: 0.46, fill: { color: C.card }, line: { color: C.cardLine, width: 1 }, rectRadius: 0.09 });
          txt(s, String(i + 1), rx, y, 0.46, 0.46, { fontSize: 14, bold: true, color: C.muted, align: "center", valign: "middle" }); }
        txt(s, t, rx + 0.65, y - 0.02, rw - 0.65, 1.15, { fontSize: 16, bold: cur, color: cur ? C.navy : C.muted }); });
      points(s, stepPoints[k]); } }

  // ============ 13. SPEED ============
  { const s = light("Fast enough for a web page");
    txt(s, "Translation latency, median (log scale)", M, T, 7.0, 0.4, { fontSize: 18, bold: true, color: C.navy });
    const rowsL = [["up to 1 kb", 21, "~20 ms"], ["10 kb", 115, "115 ms"], ["100 kb", 599, "0.6 s"], ["1 Mb", 4300, "4.3 s"]];
    const ax0 = 2.6, axW = 7.6, y0 = T + 1.2, pitch = 1.0; const xv = v => ax0 + (Math.log10(v) - 1) * axW / 3;
    [10, 100, 1000, 10000].forEach((d, i) => { const x = xv(d); s.addShape(pres.shapes.LINE, { x, y: y0 - 0.45, w: 0, h: pitch * 3 + 0.9, line: { color: C.hair, width: 1, dashType: "dash" } });
      txt(s, ["10 ms", "100 ms", "1 s", "10 s"][i], x - 0.5, y0 + pitch * 3 + 0.55, 1.0, 0.35, { fontSize: 14, color: C.muted, align: "center" }); });
    rowsL.forEach(([lab, v, vl], i) => { const y = y0 + i * pitch, x = xv(v);
      txt(s, lab, M, y - 0.2, 1.8, 0.4, { fontSize: 18, color: C.ink, align: "right", valign: "middle" });
      s.addShape(pres.shapes.LINE, { x: ax0, y, w: x - ax0, h: 0, line: { color: C.stem, width: 3 } });
      s.addShape(pres.shapes.OVAL, { x: x - 0.12, y: y - 0.12, w: 0.24, h: 0.24, fill: { color: C.navy }, line: { color: C.navy, width: 0 } });
      txt(s, vl, x + 0.22, y - 0.2, 1.4, 0.4, { fontSize: 20, bold: true, color: C.navy, valign: "middle" }); });
    txt(s, "About 60 queries per second on one server.", M, 6.5, W - 2 * M, 0.5, { fontSize: 20, italic: true, color: C.navy, align: "center" });
    points(s, ["a gene in a tenth of a second; a megabase in seconds", "about 60 queries a second per server", "everything is built when the page loads; nothing is precomputed per pair"]); }

  // ============ 14. ROADMAP ============
  { const s = light("Roadmap");
    const cw = (W - 2 * M - 0.4) / 2, ch = 2.45;
    [["FaRocket", "Public release", "Both tools in the UCSC Genome Browser. On the development browser now.", "next"],
     ["FaMagic", "Translation that just works", "Coordinates and tracks follow you from haplotype to haplotype. No conversion step to think about.", "next"],
     ["FaMapMarkerAlt", "From a variant to its haplotypes", "Click an HPRC variant on GRCh38, see which release 2 haplotypes carry it, and jump to the sequence there.", "planned"],
     ["FaPalette", "Ancestry in the results", "Mapping results colored by local ancestry (pclai): where the carriers sit in ancestry space, and which haplotypes to examine.", "planned"]]
      .forEach(([i, a, b, when], k) => { const x = M + (k % 2) * (cw + 0.4), y = T + Math.floor(k / 2) * (ch + 0.3);
        card(s, x, y, cw, ch); circleIcon(s, ic[i], x + 0.35, y + 0.35, 0.75, when === "next" ? C.navy : C.teal);
        txt(s, when, x + cw - 1.6, y + 0.4, 1.25, 0.3, { fontSize: 12, bold: true, color: when === "next" ? C.navy : C.teal, align: "right", charSpacing: 2 });
        txt(s, a, x + 1.3, y + 0.45, cw - 3.0, 0.6, { fontSize: 21, bold: true, color: C.navy, valign: "middle" });
        txt(s, b, x + 0.35, y + 1.3, cw - 0.7, 1.05, { fontSize: 16 }); });
    takeaway(s, "The pangenome becomes something a browser user works with, not something they know about.", 6.75);
    points(s, ["release: both tools in the public browser; development browser today", "translation already flows from In Other Genomes; it should be invisible everywhere", "HPRC variant tracks on GRCh38: click a variant, see its release 2 carriers, go there", "pclai local ancestry: color the carriers; helps pick which haplotypes to look at", "the point: the pangenome as a thing browser users work with"]); }

  // ============ 15. THANKS ============
  { const s = dark();
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 2.3, w: W, h: 0.03, fill: { color: C.teal }, line: { color: C.teal, width: 0 } });
    s.addImage({ path: path.join(FIG, "emblem2.png"), x: W - M - 5.5, y: 2.315 - 5.5 * 392 / 1678 / 2, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: M, y: 0.45, w: 1.4, h: 1.4 * 1540 / 1855 });
    txt(s, "Thank you", M, 2.7, 6, 0.7, { fontSize: 32, bold: true, color: C.white });
    txt(s, "seeskand@ucsc.edu", M, 3.6, 6.5, 0.5, { fontFace: "Courier New", fontSize: 22, color: C.gold });
    txt(s, "github.com/parsaeskandar/pangenome-index", M, 4.15, 9, 0.45, { fontFace: "Courier New", fontSize: 17, color: C.gold });
    s.addText([{ text: "Jouni Sirén  •  Benedict Paten", options: { color: C.white, fontSize: 18, breakLine: true } },
      { text: "UC Santa Cruz Computational Genomics Lab: Adam Novak, Glenn Hickey, Zia Truong, Mark Diekhans", options: { color: C.dim, fontSize: 16, breakLine: true } },
      { text: "The UCSC Genome Browser team  •  The Human Pangenome Reference Consortium", options: { color: C.dim, fontSize: 16 } }],
      { x: M, y: 5.35, w: W - 2 * M, h: 1.7, fontFace: FONT, isTextBox: true, margin: 0, valign: "top", paraSpaceAfter: 6 });
    points(s, ["thanks"]); }

  // ============ BACKUP ============
  { const s = dark(); s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: 3.35, w: 0.05, h: 0.75, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    txt(s, "Backup", 6.15, 3.3, 4, 0.85, { fontSize: 36, bold: true, color: C.white, valign: "middle" }); notes(s, "Backup slides follow."); }
  { const s = light("Backup: translation on a toy graph"); qtag(s, "Tag arrays");
    const iw = 7.0; s.addImage({ path: path.join(FIG, "own/tag4_0.png"), x: M, y: T + 0.9, w: iw, h: iw * 402 / 1032 });
    const rx = M + iw + 0.5, rw = W - M - rx;
    ["Walk the source interval with the r-index; collect the sampled tags: nodes b, e, f.", "Each tag lists every haplotype at that graph position. Purple stands on b and f.", "Nodes both visit exactly once anchor the paths: b and f.", "Walk between anchors; orange 5 sits on node e, which purple never visits: no position, never a wrong one."]
      .forEach((t, i) => { const y = T + 0.1 + i * 1.3; chip(s, String(i + 1), rx, y); txt(s, t, rx + 0.65, y - 0.02, rw - 0.65, 1.2, { fontSize: 15 }); });
    notes(s, "Backup: the worked toy example from the paper."); }
  { const s = light("Backup: by the numbers");
    const items = [["148M", "nodes in the HPRC v2.0 Minigraph-Cactus graph", C.navy], ["464", "haplotypes indexed, CHM13 and GRCh38 included", C.navy],
      ["2.6 Tbp", "bidirectional sequence in the index", C.navy], ["26 B", "tag array runs (4.9 B BWT runs)", C.navy],
      ["149 GiB", "tag array index; 23 GiB sampled tag array", C.teal], ["~250 GB", "RAM for the running service", C.teal],
      ["~60 / s", "translation queries per second on one server", C.teal], ["~100 ms", "to translate a 10 kb gene to any haplotype", C.teal]];
    const cw = (W - 2 * M - 0.9) / 4, chh = 2.35;
    items.forEach(([a, b, col], i) => { const x = M + (i % 4) * (cw + 0.3), y = T + Math.floor(i / 4) * (chh + 0.35);
      card(s, x, y, cw, chh); txt(s, a, x, y + 0.35, cw, 0.8, { fontSize: 32, bold: true, color: col, align: "center", valign: "middle" });
      txt(s, b, x + 0.25, y + 1.25, cw - 0.5, 1.0, { fontSize: 16, color: C.muted, align: "center" }); });
    notes(s, "Backup: sizes and costs for questions about what it takes to run this."); }

  await pres.writeFile({ fileName: OUT }); console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
