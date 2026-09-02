// HPRC 2026 talk deck generator (pptxgenjs) — v2 after three-reviewer pass
const pptxgen = require("pptxgenjs"); const React = require("react"); const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp"); const path = require("path"); const fa = require("react-icons/fa");
const FIG = path.join(__dirname, "..", "figures"); const OUT = path.join(__dirname, "..", "HPRC2026_talk.pptx");

const C = { navy: "003C6C", navydeep: "06294A", cardDark: "0F3557", cardDarkLine: "1D4F7C", ink: "18293B", muted: "5B6B7C",
  gold: "FDC700", teal: "0E7C9C", coral: "E4572E", white: "FFFFFF", card: "EDF1F6", cardLine: "DCE3EB", hair: "D9E1E9",
  dim: "C6D3DF", dimdark: "3D5A7A", grid: "17436B", stem: "B8C7D6", dots: "CBD5E0" };
const FONT = "Calibri", W = 13.333, H = 7.5, M = 0.6, T = 1.45;
const IMG = { "crop_mapping_input.png": [2060, 330], "crop_mapping_result.png": [2060, 675], "crop_seqtrack.png": [1650, 430],
  "crop_convert.png": [2200, 1578], "crop_dropdown.png": [1800, 850], "crop_lifted.png": [1750, 547],
  "translation.png": [2691, 1715], "tagarray.png": [2630, 1384], "emblem.png": [1678, 392], "emblem2.png": [1678, 392], "hprc_logo.png": [1855, 1540] };
async function icon(name, color, px = 256) { const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(fa[name], { color: "#" + color, size: px }));
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer()).toString("base64"); }

(async () => {
  const pres = new pptxgen(); pres.layout = "LAYOUT_WIDE"; pres.author = "Parsa Eskandar";
  pres.title = "A pangenome sequence search and coordinate translation service for the UCSC Genome Browser";
  const ic = {}; for (const k of ["FaSearch", "FaRandom", "FaLayerGroup", "FaCheck", "FaExclamation", "FaRocket"]) ic[k] = await icon(k, C.white);

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

  // ============ 4. THREE QUESTIONS ============
  const Q = [["FaSearch", "I have a sequence.", "Which haplotypes carry it, and where?", "from a shell only"],
    ["FaRandom", "I have a CHM13 region.", "Where is it on HG02015?", "56 pairs have chains"],
    ["FaLayerGroup", "When I get there,", "can I see the genes?", "only its own tracks"]];
  const cw3 = (W - 2 * M - 0.8) / 3;
  { const s = light("Three questions the browser can't answer today");
    Q.forEach(([i, a, b, today], k) => { const x = M + k * (cw3 + 0.4), y = T, h = 4.5; card(s, x, y, cw3, h);
      circleIcon(s, ic[i], x + 0.35, y + 0.4, 0.85);
      txt(s, a, x + 0.35, y + 1.5, cw3 - 0.7, 0.5, { fontSize: 20, bold: true, color: C.navy });
      txt(s, b, x + 0.35, y + 2.05, cw3 - 0.7, 1.0, { fontSize: 20 });
      txt(s, "today", x + 0.35, y + 3.2, cw3 - 0.7, 0.35, { fontSize: 16, color: C.muted });
      txt(s, today, x + 0.35, y + 3.55, cw3 - 0.7, 0.7, { fontSize: 26, bold: true, color: C.coral, valign: "middle" }); });
    takeaway(s, "By the end of this talk: all three, in the browser, in seconds.");
    notes(s, `[1:50-2:30]
Strip this down to what a browser user actually types.
One: I have a sequence. Which haplotypes carry it, and where?
Two: I have a region on CHM13. Where is it on HG02015?
Three: when I get there, can I see the genes?
Everyone in this room can answer all three with enough shell. Nobody can answer any of them from the browser, in seconds, for an arbitrary pair. By the end of this talk: all three, live.`); }

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

  // ============ 6. TAG ARRAYS ============
  { const s = light("Every base knows every haplotype that carries it");
    const iw = 8.5, ih = iw * 1384 / 2630; s.addImage({ path: path.join(FIG, "tagarray.png"), x: M, y: T + 0.25, w: iw, h: ih });
    const rx = M + iw + 0.45, rw = W - M - rx;
    [["r-index", "where does this string occur, across all 464 haplotypes?"], ["tag arrays", "which graph node is that occurrence on? One tag per BWT run, so it fits in memory."], ["GBWT / FastLocate", "who else stands on this node, and at what offset?"]]
      .forEach(([a, b], k) => { const y = T + 0.2 + k * 1.45; txt(s, a, rx, y, rw, 0.4, { fontSize: 18, bold: true, color: C.navy }); txt(s, b, rx, y + 0.42, rw, 1.0, { fontSize: 16 }); });
    card(s, rx, T + 4.6, rw, 0.7, C.card); txt(s, "No pairwise index anywhere.", rx, T + 4.6, rw, 0.7, { fontSize: 17, bold: true, color: C.navy, align: "center", valign: "middle" });
    notes(s, `[3:15-4:25]
The foundation is our tag-array index, from the lossless pangenome indexing work.
An r-index over all 464 haplotypes tells you where a string occurs, but only as a position in a text. Tag arrays add one thing: every position in the BWT also carries its node in the graph. So a string match doesn't give you an offset. It gives you a place in the graph. One tag per BWT run, not per position, which is why this fits in memory.
And once you're standing on a node, the GBWT tells you every haplotype that passes through it, and where. All 464, in a single lookup.
Notice what's missing: nothing anywhere says CHM13-to-HG02015. That is the property that makes any-to-any translation possible.`); }

  // ============ 7. TRANSLATION ============
  { const s = light("Translating a region is a walk, not a lookup");
    const iw = 7.6, ih = iw * 1715 / 2691; s.addImage({ path: path.join(FIG, "translation.png"), x: M, y: T + 0.1, w: iw, h: ih });
    const rx = M + iw + 0.4, rw = W - M - rx;
    ["Find the query's nodes on the source path.", "Ask the tag arrays who else is here.", "Nodes both visit exactly once: unambiguous anchors.", "Walk between anchors, base by base; group shared offsets into chain blocks."]
      .forEach((t, i) => { const y = T + 0.15 + i * 1.2; chip(s, String(i + 1), rx, y); txt(s, t, rx + 0.65, y - 0.02, rw - 0.65, 1.1, { fontSize: 17 }); });
    takeaway(s, "The output is a chain. Orthology is the graph's. Missing positions are possible; a repeat cannot manufacture a wrong one.");
    notes(s, `[4:25-5:55]
With that one property in hand, translating a region stops being a lookup and becomes a walk.
(1) Find the query interval's nodes on the source haplotype's path.
(2) At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once.
(3) Nodes that source and target each visit exactly once are unambiguous anchors. Orthology is inherited from the graph's alignment. What we guarantee is that a repeat can't manufacture a false anchor, and a colinearity check drops pairs whose spans disagree.
(4) Walk the graph between anchors, one base at a time, and group the bases that share an offset into blocks. A block breaks on an indel, never on a SNP; an inversion starts a new chain. That is exactly what a chain file means.
So the output isn't a coordinate. It is a chain, and the browser already knows what to do with a chain. And if the target simply doesn't contain the interval, you get fewer positions, never invented ones.`); }

  // ============ 8. SEARCH ============
  { const s = light("One mapping returns every assembly that carries it"); qtag(s, "Question 1");
    const fr = browser(s, ["crop_mapping_result.png"], M, T, W - 2 * M);
    const cw = (W - 2 * M - 0.8) / 3;
    ["Mapped once, to the whole graph, with vg giraffe.", "Every assembly carrying it, ranked by identity.", "Click a haplotype: re-surjected, not remapped."]
      .forEach((t, i) => { const x = M + i * (cw + 0.4), y = fr.bottom + 0.3; chip(s, String(i + 1), x, y); txt(s, t, x + 0.65, y - 0.02, cw - 0.65, 0.9, { fontSize: 17 }); });
    txt(s, "MAPQ is 0 by design: every locus exists hundreds of times in this graph. Per-haplotype identity and coverage replace it.", M, 6.75, W - 2 * M, 0.45, { fontSize: 15, color: C.muted, align: "center" });
    notes(s, `[5:55-6:55]
That's the whole method. Now the three questions, starting with the first.
This is the Pangenome Mapping page: BLAT, but for the pangenome. You paste a sequence. It is mapped once, to the whole graph, with vg giraffe. You get back every assembly consistent with it, ranked by identity, and a position on whichever haplotype you pick. Picking a different haplotype re-surjects the same alignment; nothing is remapped.
You'll notice MAPQ zero. That's not a bad alignment; that's what MAPQ means in a graph where every locus exists hundreds of times. We report identity and coverage per haplotype instead.`); }

  // ============ 9. NATIVE TRACK ============
  { const s = light("...and it lands as a native track");
    const fr = browser(s, ["crop_seqtrack.png"], M, T, W - 2 * M, 4.9);
    const ih = (fr.w - 0.24) * 430 / 1650; const iy = T + 0.34;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: fr.x + 0.12, y: iy + ih * 0.355, w: fr.w - 0.24, h: ih * 0.075, fill: { color: C.gold, transparency: 100 }, line: { color: C.gold, width: 2.5 }, rectRadius: 0.05 });
    takeaway(s, "The mapped sequence, drawn as a track on HG01167 hap1. Base-level differences, BLAT-style.", fr.bottom + 0.35);
    notes(s, `[6:55-7:25]
Click through to a haplotype, here HG01167 hap1, and you don't land on a special page. You land in the browser, with the sequence as a native track and base-level differences colored the way BLAT users already know. Nothing here is a special case.`); }

  // ============ 10. CONVERT ============
  { const s = light("Any region, any of 464 haplotypes, in about 100 ms"); qtag(s, "Question 2");
    const fr = browser(s, ["crop_convert.png"], M, T, 7.3, 5.45);
    const rx = M + 7.3 + 0.35, rw = W - M - rx;
    txt(s, "CHM13", rx, T + 0.1, rw, 0.35, { fontSize: 16, bold: true, color: C.muted });
    txt(s, "chr6:32,768,058-32,778,749", rx, T + 0.45, rw, 0.45, { fontSize: 18, fontFace: "Courier New" });
    s.addShape(pres.shapes.DOWN_ARROW, { x: rx + 0.1, y: T + 1.0, w: 0.35, h: 0.45, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    txt(s, "HG02015 paternal", rx, T + 1.55, rw, 0.35, { fontSize: 16, bold: true, color: C.muted });
    txt(s, "CM085893.1:32,953,289-32,963,978", rx, T + 1.9, rw, 0.8, { fontSize: 18, fontFace: "Courier New" });
    card(s, rx, T + 2.85, rw, 0.95); txt(s, "100% of bases, 100% of span", rx, T + 2.85, rw, 0.95, { fontSize: 22, bold: true, color: C.navy, align: "center", valign: "middle" });
    txt(s, "About 115 ms for this 10.7 kb region. GRCh38 is a path in the graph too, so hg38 can be the source.", rx, T + 4.0, rw, 1.4, { fontSize: 17 });
    notes(s, `[7:25-8:15]
Question two starts from coordinates instead of a sequence. Convert Coordinates Between Assemblies. Source: CHM13, a ten-kilobase region on chromosome 6. Target: any of the other 463 haplotypes; the picker can show only the ones that actually contain the region.
Result: HG02015 paternal, contig CM085893, a hundred percent of bases, a hundred percent of span, in about a hundred milliseconds. And GRCh38 is a path in this graph too, so hg38 works as the source.`); }

  // ============ 11. HGCONVERT ============
  { const s = light("No new habits: it lives inside hgConvert too");
    browser(s, ["crop_dropdown.png"], M, T, 7.8);
    const rx = M + 7.8 + 0.4, rw = W - M - rx;
    txt(s, "Pangenome assemblies appear in the ordinary assembly menu.", rx, T + 0.2, rw, 1.1, { fontSize: 18 });
    txt(s, "Pick one, and the conversion goes through the graph instead of a chain file.", rx, T + 1.5, rw, 1.3, { fontSize: 18 });
    card(s, rx, T + 3.0, rw, 0.9); txt(s, "Same button. New capability.", rx, T + 3.0, rw, 0.9, { fontSize: 19, bold: true, color: C.navy, align: "center", valign: "middle" });
    notes(s, `[8:15-8:40]
And it asks nothing new of anyone. Open the ordinary hgConvert page and the pangenome assemblies are simply in the menu. Pick one, and the conversion goes through the graph instead of a chain file. Same button, new capability.
(Skip this slide if running long.)`); }

  // ============ 12. PAYOFF ============
  { const s = light("Arrive with the annotations you left behind"); qtag(s, "Question 3");
    const fr = browser(s, ["crop_lifted.png"], M, T, W - 2 * M);
    txt(s, "HG02015 paternal has its own CAT and Liftoff genes. What it will never have is everything that exists once, on one reference: ClinVar, GWAS, ENCODE, your lab's BED file. Here, CHM13's tracks on HG02015, over a chain built for this page view.",
      M, fr.bottom + 0.15, W - 2 * M, 1.0, { fontSize: 16 });
    txt(s, "translation blocks  →  bigChain  →  QuickLift draws them   •   Alignment Differences marks insertions, deletions and mismatches", M, 6.85, W - 2 * M, 0.4, { fontSize: 15, color: C.muted, align: "center" });
    notes(s, `[8:40-10:20]  SLOW DOWN. This is the slide the talk exists for.
But a coordinate on its own is a lonely thing. Question three, and this is the one I care about most.
This is HG02015 paternal. Release 2 gave it CAT and Liftoff genes, and per-assembly annotation is the right answer where it exists. What HG02015 does not have, and never will, is everything else: ClinVar, the GWAS catalog, ENCODE, your lab's BED file. Those live once, on one reference.
And here they are: CHM13's tracks, drawn at their translated positions, under an Alignment Differences track marking every insertion, deletion and mismatch between the two assemblies.
(pause) The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain, the browser's own QuickLift drew the tracks, and the chain is reused for every pan.
That's what I mean by making release 2 useful. The thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. Any of these assemblies can borrow them, on demand, for the region you're actually looking at.`); }

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
    notes(s, `[10:20-11:10]
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
    notes(s, `[11:10-12:00]
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
    notes(s, `[12:00-13:05]
Two things I want to be honest about before I stop.
Chains are built per view, so if you pan far enough we build another one. And wide, segdup-dense spans lose positions: on 1q21.1 we recover about half. Missing, not wrong. This runs on the development browser, as one service with about 250 gigabytes of RAM, and there is no public API yet.
What's next. Chains that persist: right now a widened chain dies with your session; share it across users and popular regions are free after the first visit. Better recovery in segdups. A documented JSON API, because half of you will want this from a pipeline, not a browser. And more graphs: nothing here is specific to release 2; a new release plugs in by building one index.
And the milestone all of that serves: the public UCSC Genome Browser.`); }

  // ============ 16. VISION (rhymes with slide 4) ============
  { const s = dark();
    txt(s, "All three: yes", M, 0.42, W - 2 * M, 0.78, { fontSize: 32, bold: true, color: C.white, valign: "middle" });
    Q.forEach(([i, a, b], k) => { const x = M + k * (cw3 + 0.4), y = T, h = 4.5; card(s, x, y, cw3, h, C.cardDark, C.cardDarkLine);
      circleIcon(s, ic[i], x + 0.35, y + 0.4, 0.85, C.teal);
      txt(s, a, x + 0.35, y + 1.5, cw3 - 0.7, 0.5, { fontSize: 20, bold: true, color: C.white });
      txt(s, b, x + 0.35, y + 2.05, cw3 - 0.7, 1.0, { fontSize: 20, color: C.dim });
      txt(s, k === 2 ? "the reference's tracks, over a chain built on the spot" : "in the browser, in seconds", x + 0.35, y + 3.2, cw3 - 0.7, 0.35, { fontSize: 14, color: C.dim });
      txt(s, "yes", x + 0.35, y + 3.55, cw3 - 0.7, 0.7, { fontSize: 40, bold: true, color: C.gold, valign: "middle" }); });
    txt(s, "Live on the development browser today. Bring me your hardest region, and tell me where it breaks.", M, 6.3, W - 2 * M, 0.6, { fontSize: 22, italic: true, color: C.gold, align: "center", valign: "middle" });
    notes(s, `[13:05-13:45]
So, back to the three questions I promised.
Which haplotypes carry my sequence? Yes. Where is my region on HG02015? Yes. Can I see the genes when I get there? Yes: the reference's tracks, over a chain built on the spot.
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
    notes(s, `[13:45-14:00]
None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you. Questions.`); }

  // ============ BACKUP ============
  { const s = dark(); s.addShape(pres.shapes.RECTANGLE, { x: 5.9, y: 3.35, w: 0.05, h: 0.75, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    txt(s, "Backup", 6.15, 3.3, 4, 0.85, { fontSize: 32, bold: true, color: C.white, valign: "middle" }); notes(s, "Backup slides for questions."); }
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
      ["~11 GB", "GBWT FastLocate structure", C.teal], ["~250 GB", "RAM for the running service", C.teal],
      ["35 min", "index build for the routing structure, 32 threads", C.teal], ["1.78 GB", "that structure on disk (naive all-pairs: 17 TB)", C.teal],
      ["15 lines", "changed in kent core, across 3 files", C.navy], ["385", "browser-side tests: payload validation, UI, hub writes", C.navy]];
    const cw = (W - 2 * M - 0.9) / 4, chh = 2.35;
    items.forEach(([a, b, col], i) => { const x = M + (i % 4) * (cw + 0.3), y = T + Math.floor(i / 4) * (chh + 0.35);
      card(s, x, y, cw, chh); txt(s, a, x, y + 0.35, cw, 0.8, { fontSize: 32, bold: true, color: col, align: "center", valign: "middle" });
      txt(s, b, x + 0.25, y + 1.25, cw - 0.5, 1.0, { fontSize: 16, color: C.muted, align: "center" }); });
    notes(s, "Backup: sizes and costs for questions about what it takes to run this."); }

  await pres.writeFile({ fileName: OUT }); console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
