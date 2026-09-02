// HPRC 2026 talk deck generator (pptxgenjs)
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");
const fa = require("react-icons/fa");

const FIG = path.join(__dirname, "..", "figures");
const OUT = path.join(__dirname, "..", "HPRC2026_talk.pptx");

// ---------- palette (matches the poster) ----------
const C = {
  navy: "003C6C", navydeep: "06294A", ink: "18293B", muted: "5B6B7C",
  gold: "FDC700", amber: "C98A00", teal: "0E7C9C", coral: "E4572E",
  green: "2E7D32", white: "FFFFFF", chip: "F1F4F8", sky: "E7F0F7",
  hair: "D9E1E9", dim: "9DB0C4", dimdark: "3D5A7A",
};
const FONT = "Calibri";
const W = 13.333, H = 7.5, M = 0.6;

// ---------- icon rasterizer ----------
async function icon(name, color, px = 256) {
  const Cmp = fa[name];
  if (!Cmp) throw new Error("no icon " + name);
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Cmp, { color: "#" + color, size: px }));
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// image pixel sizes (for aspect-correct placement)
const IMG = {
  "mapping_page.png": [3160, 1780], "pangenome_seq_track.png": [3370, 955],
  "convert_page.png": [3160, 1580], "hgconvert_dropdown.png": [3280, 1820],
  "lifted_annotations.png": [2415, 548], "translation.png": [2691, 1715],
  "tagarray.png": [2630, 1384], "grids.png": [2783, 982], "emblem.png": [1678, 392],
  "grid_sparse.png": [1671, 1011], "hprc_logo.png": [1855, 1540],
};

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Parsa Eskandar";
  pres.title = "A pangenome sequence search and coordinate translation service for the UCSC Genome Browser";

  const ic = {};
  for (const [k, col] of [["FaSearch", C.white], ["FaRandom", C.white], ["FaLayerGroup", C.white],
    ["FaRocket", C.white], ["FaDatabase", C.white], ["FaBolt", C.white], ["FaCheck", C.white],
    ["FaTimes", C.white], ["FaSearch_n", C.navy], ["FaRandom_n", C.navy], ["FaLayerGroup_n", C.navy],
    ["FaGlobe", C.white], ["FaProjectDiagram", C.white], ["FaMapMarkedAlt", C.white],
    ["FaChartLine", C.white], ["FaTools", C.white], ["FaDna", C.white], ["FaExclamation", C.white]]) {
    ic[k] = await icon(k.replace(/_n$/, ""), col);
  }

  let n = 0;
  const notes = (s, t) => s.addNotes(t.trim());
  const num = (s, dark) => { n++; s.addText(String(n), { x: W - 1.0, y: H - 0.45, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 10,
    color: dark ? C.dimdark : C.dim, align: "right", isTextBox: true, margin: 0 }); };

  function light(title, sub) {
    const s = pres.addSlide(); s.background = { color: C.white };
    s.addText(title, { x: M, y: 0.42, w: W - 2 * M, h: 0.75, fontFace: FONT, fontSize: 32, bold: true, color: C.navy, isTextBox: true, margin: 0, valign: "middle" });
    if (sub) s.addText(sub, { x: M, y: 1.12, w: W - 2 * M, h: 0.4, fontFace: FONT, fontSize: 15, color: C.muted, isTextBox: true, margin: 0, valign: "middle" });
    num(s, false); return s;
  }
  function dark() { const s = pres.addSlide(); s.background = { color: C.navydeep }; num(s, true); return s; }

  function card(s, x, y, w, h, fill = C.chip) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.12 });
  }
  function circleIcon(s, data, x, y, d, fill = C.navy) {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 } });
    const p = d * 0.26; s.addImage({ data, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
  }
  function chip(s, label, x, y, d = 0.42) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: d, h: d, fill: { color: C.gold }, line: { color: C.gold, width: 0 }, rectRadius: 0.08 });
    s.addText(label, { x, y, w: d, h: d, fontFace: FONT, fontSize: 14, bold: true, color: C.navydeep, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  }
  // browser-window frame with a contained image; returns bottom y
  function browser(s, file, x, y, w, maxH) {
    const [pw, ph] = IMG[file]; const chrome = 0.36, pad = 0.12;
    let iw = w - 2 * pad, ih = iw * ph / pw;
    if (maxH && ih > maxH - chrome - pad) { ih = maxH - chrome - pad; iw = ih * pw / ph; }
    const h = chrome + ih + pad;
    card(s, x, y, w, h, C.chip);
    for (const [i, col] of [["E4572E", 0], ["FDC700", 1], ["2E7D32", 2]].map((v, i) => [i, v[0]]))
      s.addShape(pres.shapes.OVAL, { x: x + 0.18 + i * 0.2, y: y + 0.11, w: 0.12, h: 0.12, fill: { color: col }, line: { color: col, width: 0 } });
    s.addText("genome.ucsc.edu", { x: x + 0.9, y: y + 0.04, w: 3, h: 0.26, fontFace: "Courier New", fontSize: 9, color: C.muted, isTextBox: true, margin: 0, valign: "middle" });
    s.addImage({ path: path.join(FIG, file), x: x + (w - iw) / 2, y: y + chrome, w: iw, h: ih });
    return y + h;
  }
  const body = (s, text, x, y, w, h, o = {}) => s.addText(text, Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 16, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));
  const bullets = (s, items, x, y, w, h, o = {}) => s.addText(items.map((t, i) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: 8 } })),
    Object.assign({ x, y, w, h, fontFace: FONT, fontSize: 15, color: C.ink, isTextBox: true, margin: 0, valign: "top" }, o));

  // ================= 1. TITLE =================
  {
    const s = dark();
    s.addImage({ path: path.join(FIG, "emblem.png"), x: 3.9, y: 1.15, w: 5.5, h: 5.5 * 392 / 1678 });
    s.addText("HPRC 2026", { x: M, y: 0.4, w: 4, h: 0.35, fontFace: FONT, fontSize: 13, bold: true, color: C.gold, isTextBox: true, margin: 0, charSpacing: 3 });
    s.addText([{ text: "The UCSC Genome Browser", options: { breakLine: true } }, { text: "now speaks pangenome.", options: { color: C.gold } }],
      { x: M, y: 2.8, w: W - 2 * M, h: 1.9, fontFace: FONT, fontSize: 46, bold: true, color: C.white, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText("Sequence search and coordinate translation across all 466 HPRC release 2 assemblies",
      { x: M, y: 4.7, w: W - 2 * M, h: 0.5, fontFace: FONT, fontSize: 18, color: C.dim, align: "center", isTextBox: true, margin: 0 });
    s.addText("Parsa Eskandar   •   Jouni Sirén   •   Benedict Paten", { x: M, y: 5.75, w: W - 2 * M, h: 0.45, fontFace: FONT, fontSize: 20, color: C.white, align: "center", isTextBox: true, margin: 0 });
    s.addText("UC Santa Cruz Genomics Institute", { x: M, y: 6.25, w: W - 2 * M, h: 0.4, fontFace: FONT, fontSize: 15, color: C.dim, align: "center", isTextBox: true, margin: 0 });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: W - M - 1.5, y: H - 0.55 - 1.5 * 1540 / 1855, w: 1.5, h: 1.5 * 1540 / 1855 });
    notes(s, `[0:00-0:20]
Thanks. I'm Parsa Eskandar from Benedict Paten's lab at UC Santa Cruz, and I want to show you something we built with the UCSC Genome Browser team: the browser can now speak pangenome.
(Advance on "speak pangenome".)`);
  }

  // ================= 2. HOOK =================
  {
    const s = dark();
    s.addText("Every fact we know about the human genome has an address.",
      { x: M, y: 1.1, w: 7.4, h: 2.2, fontFace: FONT, fontSize: 36, bold: true, color: C.white, isTextBox: true, margin: 0, valign: "top" });
    s.addText([{ text: "Almost all of them are written in ", options: { color: C.dim } }, { text: "hg38", options: { color: C.white, bold: true } },
      { text: " or ", options: { color: C.dim } }, { text: "CHM13", options: { color: C.white, bold: true } }, { text: ".", options: { color: C.dim } }],
      { x: M, y: 3.5, w: 7.4, h: 0.6, fontFace: FONT, fontSize: 22, isTextBox: true, margin: 0 });
    s.addText("HPRC release 2 adds", { x: 8.6, y: 1.05, w: 4.2, h: 0.5, fontFace: FONT, fontSize: 20, color: C.dim, isTextBox: true, margin: 0, align: "center" });
    s.addText("+466", { x: 8.3, y: 1.45, w: 4.8, h: 2.1, fontFace: FONT, fontSize: 120, bold: true, color: C.gold, isTextBox: true, margin: 0, align: "center", valign: "middle" });
    s.addText("genomes. And 466 coordinate systems.", { x: 8.3, y: 3.55, w: 4.8, h: 0.5, fontFace: FONT, fontSize: 20, color: C.white, isTextBox: true, margin: 0, align: "center" });
    s.addImage({ path: path.join(FIG, "grid_sparse.png"), x: 8.55, y: 4.3, w: 4.3, h: 4.3 * 1011 / 1671 });
    s.addText("How do we make everything we already know findable in every one of them?",
      { x: M, y: 5.0, w: 7.4, h: 1.4, fontFace: FONT, fontSize: 24, italic: true, color: C.gold, isTextBox: true, margin: 0, valign: "top" });
    notes(s, `[0:20-1:20]
Every fact we know about the human genome has an address: a chromosome and a position. And almost every one of those addresses is written in one of two coordinate systems: hg38 or CHM13.
HPRC release 2 just handed us 466 more genomes. Which means 466 more coordinate systems.
(pause)
That is a gift and a problem. The gift is obvious. The problem is this talk: how do we make everything we already know findable in every one of them?`);
  }

  // ================= 3. TWO TOOLS BREAK =================
  {
    const s = light("Two old tools, and why both break at 466");
    const cy = 1.45, ch = 4.55;
    card(s, M, cy, 5.75, ch);
    circleIcon(s, ic.FaSearch, M + 0.3, cy + 0.3, 0.7);
    body(s, "Alignment (BLAT)", M + 1.2, cy + 0.36, 4.2, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["One assembly at a time.", "There are 466 assemblies now.", "Nobody can ask the graph itself: who carries this sequence?"], M + 0.3, cy + 1.3, 5.15, 3.0, { fontSize: 17 });
    const x2 = M + 6.05;
    card(s, x2, cy, W - M - x2, ch);
    circleIcon(s, ic.FaRandom, x2 + 0.3, cy + 0.3, 0.7);
    body(s, "Lift-over (chain files)", x2 + 1.2, cy + 0.36, 4.5, 0.55, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["A chain is pairwise: 466 × 466 is about 213,000 pairs.", "Chains in the browser database today: 56."], x2 + 0.3, cy + 1.3, 5.7, 1.3, { fontSize: 17 });
    s.addImage({ path: path.join(FIG, "grids.png"), x: x2 + 0.45, y: cy + 2.55, w: 5.5, h: 5.5 * 982 / 2783 });
    body(s, "The graph is the alignment of all of them at once. In the browser, it has been a file, not a tool.",
      M, 6.3, W - 2 * M, 0.6, { fontSize: 19, italic: true, color: C.navy, align: "center" });
    notes(s, `[1:20-2:35]
For thirty years, two tools have moved knowledge between genomes.
(point left) Alignment. You have a sequence, you BLAT it. But BLAT runs against one assembly at a time. There are 466 now, and nothing lets you ask the graph itself: who carries this?
(point right) Lift-over. A chain file between two assemblies, and QuickLift can draw one assembly's tracks on top of another. But a chain is a pairwise object. With 466 assemblies that's about 213,000 pairs. We counted what actually exists in the browser database: 56.
The pangenome graph is, in principle, the alignment of all of them at once. But inside the browser, it has been a file, not a tool.`);
  }

  // ================= 4. THREE QUESTIONS =================
  {
    const s = light("What a browser user actually wants to ask");
    const qs = [["FaSearch", "I have a sequence.", "Which haplotypes carry it, and where?"],
      ["FaRandom", "I have a CHM13 region.", "Where is it on HG02015?"],
      ["FaLayerGroup", "When I get there,", "can I see the genes?"]];
    const cw = (W - 2 * M - 0.8) / 3;
    qs.forEach(([i, a, b], k) => {
      const x = M + k * (cw + 0.4), y = 1.6, h = 4.6;
      card(s, x, y, cw, h);
      circleIcon(s, ic[i], x + 0.35, y + 0.4, 0.9);
      body(s, a, x + 0.35, y + 1.6, cw - 0.7, 0.5, { fontSize: 20, bold: true, color: C.navy });
      body(s, b, x + 0.35, y + 2.2, cw - 0.7, 1.0, { fontSize: 20, color: C.ink });
      body(s, "today", x + 0.35, y + 3.45, 1.2, 0.5, { fontSize: 15, color: C.muted, valign: "middle" });
      body(s, "no", x + 1.3, y + 3.3, 2.0, 0.8, { fontSize: 40, bold: true, color: C.coral, valign: "middle" });
    });
    body(s, "By the end of this talk: all three, live, in the browser you already use.", M, 6.45, W - 2 * M, 0.5, { fontSize: 18, italic: true, color: C.navy, align: "center" });
    notes(s, `[2:35-3:20]
Strip this down to what a browser user actually types.
One: I have a sequence. Which haplotypes carry it, and where?
Two: I have a region on CHM13. Where is it on HG02015?
Three: when I get there, can I see the genes?
Today the honest answer to all three is no. By the end of this talk I want to have answered all three: live, inside the browser you already use.`);
  }

  // ================= 5. WHAT WE BUILT =================
  {
    const s = light("We taught the UCSC Genome Browser to speak pangenome");
    const lx = M, lw = 7.6;
    // browser layer
    card(s, lx, 1.5, lw, 1.3, C.sky);
    body(s, "UCSC Genome Browser", lx + 0.3, 1.6, 4, 0.4, { fontSize: 18, bold: true, color: C.navy });
    ["Pangenome Mapping", "Convert Coordinates", "hgConvert"].forEach((t, i) => {
      const cx = lx + 0.3 + i * 2.35;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: 2.1, w: 2.2, h: 0.5, fill: { color: C.white }, line: { color: C.hair, width: 1 }, rectRadius: 0.08 });
      body(s, t, cx, 2.1, 2.2, 0.5, { fontSize: 13, color: C.ink, align: "center", valign: "middle" });
    });
    s.addShape(pres.shapes.LINE, { x: lx + lw / 2, y: 2.8, w: 0, h: 0.5, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
    body(s, "HTTPS, JSON", lx + lw / 2 + 0.15, 2.85, 2, 0.4, { fontSize: 12, color: C.muted });
    // service layer
    card(s, lx, 3.3, lw, 0.75, C.sky);
    body(s, "pangenome service", lx, 3.3, lw, 0.75, { fontSize: 17, bold: true, color: C.navy, align: "center", valign: "middle" });
    // two engines
    s.addShape(pres.shapes.LINE, { x: lx + 1.9, y: 4.05, w: 0, h: 0.45, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
    s.addShape(pres.shapes.LINE, { x: lx + 5.7, y: 4.05, w: 0, h: 0.45, line: { color: C.navy, width: 2, endArrowType: "triangle" } });
    card(s, lx, 4.5, 3.6, 1.15, C.chip); card(s, lx + 4.0, 4.5, 3.6, 1.15, C.chip);
    body(s, "vg giraffe", lx + 0.25, 4.6, 3.2, 0.4, { fontSize: 16, bold: true, color: C.navy });
    body(s, "maps a sequence to the whole graph", lx + 0.25, 5.0, 3.2, 0.6, { fontSize: 13, color: C.muted });
    body(s, "pangenome-index", lx + 4.25, 4.6, 3.2, 0.4, { fontSize: 16, bold: true, color: C.navy });
    body(s, "tag arrays: any-to-any coordinate translation", lx + 4.25, 5.0, 3.2, 0.6, { fontSize: 13, color: C.muted });
    // graph base
    card(s, lx, 5.95, lw, 0.75, C.navy);
    body(s, "HPRC v2.0 Minigraph-Cactus graph   •   233 samples   •   464 haplotypes   •   148M nodes", lx, 5.95, lw, 0.75, { fontSize: 13, color: C.white, align: "center", valign: "middle" });
    // right: capabilities
    const rx = M + lw + 0.6, rw = W - M - rx;
    const caps = [["FaSearch", "Search", "which haplotypes carry a sequence, and where"],
      ["FaRandom", "Translate", "a region between any two of 466 assemblies"],
      ["FaLayerGroup", "Lift annotations", "arrive with the source's tracks drawn in place"]];
    caps.forEach(([i, t, d], k) => {
      const y = 1.6 + k * 1.75;
      circleIcon(s, ic[i], rx, y, 0.85);
      body(s, t, rx + 1.1, y - 0.02, rw - 1.1, 0.45, { fontSize: 20, bold: true, color: C.navy });
      body(s, d, rx + 1.1, y + 0.45, rw - 1.1, 0.9, { fontSize: 15, color: C.ink });
    });
    body(s, "Core browser changes: 3 files, 15 lines.", rx, 6.85 - 0.5, rw, 0.4, { fontSize: 13, italic: true, color: C.muted });
    notes(s, `[3:20-4:10]
Here's the whole system in one breath. The browser talks to a service. The service holds two engines over the HPRC v2 graph: vg giraffe, for mapping sequences, and our coordinate-translation index. Everything else is presentation: three pages in the browser, and three things they do. Search. Translate. Lift annotations.
Let me start with the one idea that makes translation possible at all.`);
  }

  // ================= 6. TAG ARRAYS =================
  {
    const s = light("One index, every haplotype", "Tag arrays (lossless pangenome indexing): every BWT position carries its graph position.");
    const iw = 10.2, ih = iw * 1384 / 2630;
    s.addImage({ path: path.join(FIG, "tagarray.png"), x: (W - iw) / 2, y: 1.65, w: iw, h: ih });
    notes(s, `[4:10-5:25]
The foundation is the tag-array index, from our lossless pangenome indexing work.
A standard FM-index or r-index over all 464 haplotype sequences will find where a string occurs. But it only gives you positions in a text. Tag arrays annotate every position of the BWT with its graph position: the node it belongs to.
And once you're standing on a node, the GBWT tells you every haplotype that passes through it, and where. All 464, in a single lookup.
Notice what's missing: there is no per-pair index anywhere. Nothing that says CHM13-to-HG02015. That one property is what makes any-to-any translation possible.`);
  }

  // ================= 7. TRANSLATION =================
  {
    const s = light("Translating a region is a walk, not a lookup");
    const iw = 7.5, ih = iw * 1715 / 2691;
    s.addImage({ path: path.join(FIG, "translation.png"), x: M, y: 1.55, w: iw, h: ih });
    const steps = ["Locate the query interval's nodes on the source haplotype's path.",
      "Tag arrays report, at every node, each haplotype standing on it and where.",
      "Nodes visited exactly once by both source and target are guaranteed orthologous anchors.",
      "A walk between anchors emits per-base offsets, folded into chain blocks: broken by indels and inversions, never by SNPs."];
    const rx = M + iw + 0.5, rw = W - M - rx;
    steps.forEach((t, i) => { const y = 1.6 + i * 1.28; chip(s, String(i + 1), rx, y + 0.02, 0.42); body(s, t, rx + 0.6, y, rw - 0.6, 1.2, { fontSize: 15 }); });
    body(s, "The output is not just a coordinate. It is a chain, and the browser already knows what to do with a chain.", M, 6.5, W - 2 * M, 0.5, { fontSize: 17, italic: true, color: C.navy, align: "center" });
    notes(s, `[5:25-6:55]
So here's how a region moves.
(1) Locate the query interval's nodes on the source haplotype's path.
(2) At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once.
(3) Nodes that source and target each visit exactly once are unambiguous anchors: guaranteed orthologous. A colinearity check drops the few pairs that don't make sense.
(4) Walk the graph between anchors and emit an offset for every base. Then fold that into blocks: a block breaks on an indel or an inversion, never on a SNP.
That last part matters. That is exactly what a chain file means. So the output of translation isn't just a coordinate. It is a chain, and the browser already knows what to do with a chain.`);
  }

  // ================= 8. SEARCH DEMO =================
  {
    const s = light("Ask the graph: which haplotypes carry my sequence?");
    browser(s, "mapping_page.png", M, 1.45, 8.3);
    const rx = M + 8.3 + 0.45, rw = W - M - rx;
    [["Mapped once, to the whole graph, with vg giraffe."], ["Every assembly carrying it, ranked by identity."], ["A position on any haplotype you pick: one click, no remapping."]]
      .forEach(([t], i) => { const y = 1.75 + i * 1.5; chip(s, String(i + 1), rx, y, 0.42); body(s, t, rx + 0.6, y - 0.02, rw - 0.6, 1.3, { fontSize: 16 }); });
    body(s, "Question 1", rx, 6.3, rw, 0.4, { fontSize: 13, bold: true, color: C.amber, charSpacing: 2 });
    notes(s, `[6:55-7:55]
Question one. This is the Pangenome Mapping page: BLAT, but for the pangenome.
You paste a sequence. It is mapped once, to the whole graph, with vg giraffe. You get back every assembly consistent with it, ranked by identity, and a position on whichever haplotype you pick. Picking a different haplotype re-surjects the same alignment; nothing is remapped.`);
  }

  // ================= 9. TRACK =================
  {
    const s = light("…and land on it as a native track");
    const by = browser(s, "pangenome_seq_track.png", M, 1.5, W - 2 * M);
    body(s, "Pangenome Seq track on HG01167 hap1: the mapped sequence with BLAT-style base-level differences.", M, by + 0.35, W - 2 * M, 0.5, { fontSize: 16, color: C.muted, align: "center" });
    body(s, "Not a special case. Just another track, on another assembly.", M, by + 0.95, W - 2 * M, 0.6, { fontSize: 20, italic: true, color: C.navy, align: "center" });
    notes(s, `[7:55-8:25]
And when you click through, the hit lands in the browser as a native track, with base-level differences colored the way BLAT users already know. Nothing here is a special case; it is just another track on another assembly.`);
  }

  // ================= 10. CONVERT DEMO =================
  {
    const s = light("Ask: where is this region on HG02015?");
    browser(s, "convert_page.png", M, 1.45, 8.1);
    const rx = M + 8.1 + 0.45, rw = W - M - rx;
    body(s, "CHM13", rx, 1.6, rw, 0.35, { fontSize: 13, bold: true, color: C.muted });
    body(s, "chr6:32,768,058-32,778,749", rx, 1.9, rw, 0.4, { fontSize: 15, fontFace: "Courier New", color: C.ink });
    body(s, "↓", rx, 2.35, rw, 0.4, { fontSize: 20, color: C.amber });
    body(s, "HG02015 paternal", rx, 2.8, rw, 0.35, { fontSize: 13, bold: true, color: C.muted });
    body(s, "CM085893.1:32,953,289-32,963,978", rx, 3.1, rw, 0.6, { fontSize: 15, fontFace: "Courier New", color: C.ink });
    card(s, rx, 3.95, rw, 1.0, C.sky);
    body(s, "100% of bases, 100% of span", rx + 0.2, 3.95, rw - 0.4, 1.0, { fontSize: 17, bold: true, color: C.navy, valign: "middle" });
    body(s, "The picker can show only the assemblies that actually contain the region. About 20 ms.", rx, 5.15, rw, 1.2, { fontSize: 15, color: C.ink });
    body(s, "Question 2", rx, 6.3, rw, 0.4, { fontSize: 13, bold: true, color: C.amber, charSpacing: 2 });
    notes(s, `[8:25-9:10]
Question two. Convert Coordinates Between Assemblies. Source CHM13, a ten-kilobase region on chromosome 6. Target: any of the other 463 haplotypes, and the picker can show only the ones that actually contain the region.
Result: HG02015 paternal, contig CM085893, a hundred percent of bases, a hundred percent of span. About twenty milliseconds.`);
  }

  // ================= 11. ARRIVE WITH ANNOTATIONS (KEY) =================
  {
    const s = light("Arrive with the annotations you left behind");
    const by = browser(s, "lifted_annotations.png", M, 1.4, W - 2 * M);
    body(s, "HG02015 paternal, showing CHM13's CAT and Liftoff genes (the HLA-DMA cluster), RefSeq and CenSat at their translated positions, under an Alignment Differences track.",
      M, by + 0.2, W - 2 * M, 0.55, { fontSize: 14, color: C.muted, align: "center" });
    const steps = [["Blocks become a bigChain", "built for this request, in about a second"],
      ["QuickLift draws the tracks", "the source's annotations, at translated positions"],
      ["Alignment Differences", "marks every insertion, deletion and mismatch"]];
    const cw = (W - 2 * M - 0.8) / 3, cy = by + 0.95, ch = 7.05 - cy;
    steps.forEach(([a, b], i) => {
      const x = M + i * (cw + 0.4); card(s, x, cy, cw, ch);
      chip(s, String(i + 1), x + 0.3, cy + 0.3, 0.42);
      body(s, a, x + 0.9, cy + 0.27, cw - 1.2, 0.45, { fontSize: 16, bold: true, color: C.navy });
      body(s, b, x + 0.9, cy + 0.8, cw - 1.2, ch - 0.9, { fontSize: 14, color: C.ink });
    });
    body(s, "Question 3", W - M - 2, 0.42, 2, 0.75, { fontSize: 13, bold: true, color: C.amber, charSpacing: 2, align: "right", valign: "middle" });
    notes(s, `[9:10-10:40]  SLOW DOWN. This is the slide the talk exists for.
Question three, and this is the one I care about most.
This is HG02015 paternal, a sample assembly with almost no annotation of its own. And you're looking at CHM13's CAT and Liftoff genes, the HLA-DMA cluster, RefSeq, CenSat, drawn at their translated positions. Above them, an Alignment Differences track marks every insertion, deletion and mismatch between the two assemblies.
(pause) The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain, the browser's own QuickLift drew the tracks, and the chain will be reused for every pan.
This is what I mean by making release 2 useful in the browser: every assembly can borrow the annotation of a well-annotated reference, on demand. No precomputation, no chain library, no waiting for someone to annotate 466 genomes.`);
  }

  // ================= 12. HGCONVERT =================
  {
    const s = light("No new habits: it lives inside hgConvert too");
    browser(s, "hgconvert_dropdown.png", M, 1.45, 7.8);
    const rx = M + 7.8 + 0.5, rw = W - M - rx;
    body(s, "Pangenome assemblies appear in the ordinary assembly menu.", rx, 1.7, rw, 1.0, { fontSize: 18, color: C.ink });
    body(s, "Pick one, and the conversion goes through the graph instead of a chain file.", rx, 2.9, rw, 1.2, { fontSize: 18, color: C.ink });
    card(s, rx, 4.4, rw, 1.0, C.sky);
    body(s, "Same button. New capability.", rx, 4.4, rw, 1.0, { fontSize: 19, bold: true, color: C.navy, align: "center", valign: "middle" });
    notes(s, `[10:40-11:10]
And it asks nothing new of users. Open the ordinary hgConvert page and the pangenome assemblies are simply in the menu. Pick one, and the conversion goes through the graph instead of a chain file. Same button, new capability.
(If running long, skip this slide.)`);
  }

  // ================= 13. PERFORMANCE =================
  {
    const s = light("Fast enough to sit behind a web page");
    const common = { fontFace: FONT, catAxisLabelColor: C.muted, valAxisLabelColor: C.muted, catAxisLabelFontSize: 12, valAxisLabelFontSize: 11,
      valGridLine: { color: C.hair, size: 0.5 }, catGridLine: { style: "none" }, showLegend: false, showTitle: true, titleColor: C.navy, titleFontSize: 15, titleFontFace: FONT,
      dataLabelFontSize: 12, dataLabelColor: C.ink, dataLabelFontFace: FONT };
    s.addChart(pres.charts.BAR, [{ name: "median latency (ms)", labels: ["100 bp", "1 kb", "10 kb", "100 kb", "1 Mb"], values: [22, 21, 115, 599, 4300] }],
      Object.assign({ x: M, y: 1.4, w: 6.1, h: 4.6, barDir: "bar", chartColors: [C.navy], title: "Translation latency, median (ms, log scale)",
        valAxisLogScaleBase: 10, valAxisMinVal: 10, valAxisMaxVal: 10000, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0",
        catAxisOrientation: "maxMin", barGapWidthPct: 60 }, common));
    s.addChart(pres.charts.LINE, [{ name: "queries / s", labels: ["1", "2", "4", "8", "16", "32"], values: [6.3, 13.2, 23.6, 60.3, 59.4, 65.3] }],
      Object.assign({ x: 7.0, y: 1.4, w: W - M - 7.0, h: 4.6, chartColors: [C.navy], lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 8,
        title: "Concurrent 3.4 kb queries (queries / s) vs threads", showValue: true, dataLabelPosition: "t", dataLabelFormatCode: "0",
        valAxisMinVal: 0, valAxisMaxVal: 80, valAxisMajorUnit: 20, catAxisTitle: "threads", showCatAxisTitle: true, catAxisTitleColor: C.muted, catAxisTitleFontSize: 12 }, common));
    const stats = [["~20 ms", "gene-scale region"], ["0.6 s", "100 kb"], ["4.3 s", "1 Mb"], ["9.6×", "throughput at 8 threads"]];
    const sw = (W - 2 * M - 0.9) / 4;
    stats.forEach(([a, b], i) => { const x = M + i * (sw + 0.3); card(s, x, 6.15, sw, 0.95);
      body(s, a, x, 6.18, sw, 0.5, { fontSize: 22, bold: true, color: C.navy, align: "center", valign: "middle" });
      body(s, b, x, 6.66, sw, 0.4, { fontSize: 12, color: C.muted, align: "center" }); });
    notes(s, `[11:10-12:00]
Is it fast enough to sit behind a web page? Gene-scale regions translate in about twenty milliseconds. A hundred kilobases in under a second. A megabase in about four.
And it scales: the index is read-only and thread-safe, so eight concurrent users get nearly ten times the throughput of one. That is why this can be a service rather than a batch job.`);
  }

  // ================= 14. NOT DONE + PLAN =================
  {
    const s = light("What's not done yet, and what's planned");
    const cw = (W - 2 * M - 0.9) / 2, cy = 1.5, ch = 4.7;
    card(s, M, cy, cw, ch, C.chip);
    body(s, "Today", M + 0.35, cy + 0.3, cw - 0.7, 0.5, { fontSize: 22, bold: true, color: C.muted });
    bullets(s, ["Chains are built per view. Pan far enough and another one is built.",
      "Wide, segmental-duplication-heavy regions lose positions: about half recovered on 1q21.1.",
      "Runs on the development browser."], M + 0.35, cy + 1.05, cw - 0.7, 4.0, { fontSize: 16 });
    s.addShape(pres.shapes.RIGHT_ARROW, { x: M + cw + 0.15, y: cy + ch / 2 - 0.3, w: 0.6, h: 0.6, fill: { color: C.gold }, line: { color: C.gold, width: 0 } });
    const x2 = M + cw + 0.9;
    card(s, x2, cy, cw, ch, C.sky);
    body(s, "Planned", x2 + 0.35, cy + 0.3, cw - 0.7, 0.5, { fontSize: 22, bold: true, color: C.navy });
    bullets(s, ["Public release in the UCSC Genome Browser.",
      "Chains that cover more, and persist: widened chains shared across users instead of dying with the session.",
      "Better recovery in wide, segdup-dense regions.",
      "New graphs plug in by building one index; nothing is release-specific."], x2 + 0.35, cy + 1.05, cw - 0.7, 4.2, { fontSize: 16 });
    notes(s, `[12:00-13:30]
Now, honestly, what's not finished, and what's planned.
Today, chains are built per view. Pan far enough and we build another one. Wide, segmental-duplication-heavy regions lose positions; on the 1q21.1 region we recover about half.
The plan. First and foremost: this is on the development browser today; the goal is the public UCSC Genome Browser.
Second, chains that cover more and persist: today a widened chain dies with the session; sharing it across users makes popular regions free after the first visit.
Third, better recovery in wide, segdup-dense regions.
And more graphs. Nothing here is specific to release 2. New HPRC releases plug in by building one index.`);
  }

  // ================= 15. VISION =================
  {
    const s = dark();
    s.addText("HPRC release 2 as a place you can browse", { x: M, y: 0.7, w: W - 2 * M, h: 0.8, fontFace: FONT, fontSize: 34, bold: true, color: C.white, isTextBox: true, margin: 0, align: "center" });
    const qs = ["Which haplotypes carry my sequence, and where?", "Where is my region on HG02015?", "Can I see the genes when I get there?"];
    qs.forEach((q, i) => {
      const y = 2.0 + i * 1.15;
      circleIcon(s, ic.FaCheck, 2.2, y + 0.05, 0.6, C.green);
      s.addText("yes", { x: 3.0, y, w: 1.3, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: C.gold, isTextBox: true, margin: 0, valign: "middle" });
      s.addText(q, { x: 4.4, y, w: 8.4, h: 0.7, fontFace: FONT, fontSize: 22, color: C.white, isTextBox: true, margin: 0, valign: "middle" });
    });
    s.addText("466 genomes. One browser. Knowledge that moves between them.", { x: M, y: 5.75, w: W - 2 * M, h: 0.8, fontFace: FONT, fontSize: 24, italic: true, color: C.dim, isTextBox: true, margin: 0, align: "center" });
    notes(s, `[13:30-14:10]
So, back to the three questions.
Which haplotypes carry my sequence? Yes. Where is my region on HG02015? Yes. Can I see the genes when I get there? Yes.
466 genomes, one browser, and knowledge that moves between them.`);
  }

  // ================= 16. THANKS =================
  {
    const s = dark();
    s.addImage({ path: path.join(FIG, "emblem.png"), x: 4.4, y: 0.8, w: 4.5, h: 4.5 * 392 / 1678 });
    s.addText("Thank you", { x: M, y: 2.2, w: W - 2 * M, h: 0.9, fontFace: FONT, fontSize: 44, bold: true, color: C.white, isTextBox: true, margin: 0, align: "center" });
    s.addText([{ text: "Jouni Sirén  •  Benedict Paten", options: { color: C.white, fontSize: 18, breakLine: true } },
      { text: "UC Santa Cruz Computational Genomics Lab: Adam Novak, Glenn Hickey, Zia Truong, Mark Diekhans", options: { color: C.dim, fontSize: 15, breakLine: true } },
      { text: "The UCSC Genome Browser team  •  The Human Pangenome Reference Consortium", options: { color: C.dim, fontSize: 15, breakLine: true } },
      { text: "Built on vg and the HPRC v2.0 graph", options: { color: C.dim, fontSize: 15 } }],
      { x: M, y: 3.35, w: W - 2 * M, h: 2.0, fontFace: FONT, isTextBox: true, margin: 0, align: "center", valign: "top", paraSpaceAfter: 6 });
    s.addText("seeskand@ucsc.edu   •   github.com/parsaeskandar/hprc_2026_poster", { x: M, y: 6.2, w: W - 2 * M, h: 0.4, fontFace: "Courier New", fontSize: 13, color: C.gold, isTextBox: true, margin: 0, align: "center" });
    s.addImage({ path: path.join(FIG, "hprc_logo.png"), x: W - M - 1.5, y: H - 0.55 - 1.5 * 1540 / 1855, w: 1.5, h: 1.5 * 1540 / 1855 });
    notes(s, `[14:10-14:25]
This is work with Jouni Sirén and Benedict Paten, with a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you, and I'm happy to take questions.`);
  }

  // ================= BACKUP =================
  {
    const s = dark();
    s.addText("Backup", { x: M, y: 3.0, w: W - 2 * M, h: 1.0, fontFace: FONT, fontSize: 40, bold: true, color: C.dim, isTextBox: true, margin: 0, align: "center" });
    notes(s, "Backup slides for questions.");
  }
  {
    const s = light("Backup: anchors and blocks, precisely");
    const cw = (W - 2 * M - 0.4) / 2;
    card(s, M, 1.5, cw, 5.3); card(s, M + cw + 0.4, 1.5, cw, 5.3);
    body(s, "Anchors", M + 0.35, 1.8, cw - 0.7, 0.5, { fontSize: 20, bold: true, color: C.navy });
    bullets(s, ["A node visited exactly once by the source path and exactly once by the target path is an unambiguous anchor: repeats can never create a false one.",
      "A colinearity gate rejects anchor pairs whose target span is wildly inconsistent with the source span (a 1 Mb query landing on 29 kb is a deletion, not a lift).",
      "The failure mode in hard regions is missing positions, never wrong ones."], M + 0.35, 2.45, cw - 0.7, 4.2, { fontSize: 15 });
    body(s, "Blocks", M + cw + 0.75, 1.8, cw - 0.7, 0.5, { fontSize: 20, bold: true, color: C.navy });
    bullets(s, ["An LF-walk between anchors emits a per-base correspondence.",
      "A block is a maximal run of constant offset: it breaks on indels, orientation flips and contig changes, never on substitutions, matching chain-file semantics.",
      "Blocks are 0-based, half-open, and become bigChain + bigLink files the browser's QuickLift draws directly.",
      "Non-monotonic target order across blocks (transpositions) is preserved, not hidden."], M + cw + 0.75, 2.45, cw - 0.7, 4.2, { fontSize: 15 });
    notes(s, "Backup: algorithm details for questions about accuracy in repeats or how blocks relate to chain files.");
  }
  {
    const s = light("Backup: chains that keep up with panning");
    bullets(s, ["Phase 1 (synchronous, ~0.7 s): the request is padded to 5× the span, clamped to 250 kb to 1 Mb.",
      "Phase 2 (background, ~11 s): a 222-byte sendBeacon fired during navigation rebuilds the chain at ±5 Mb; the browser reopens the chain file on every request, so the next pan picks it up with no reload.",
      "Lifted gene items visible after panning 4 Mb away: 1 with the phase-1 chain, 31 with the phase-2 chain."], M, 1.5, 6.4, 4.8, { fontSize: 15 });
    s.addChart(pres.charts.BAR, [{ name: "phase 1 (1.1 Mb chain)", labels: ["in window", "400 kb", "2 Mb", "4 Mb"], values: [3, 129, 1, 1] },
      { name: "phase 2 (10 Mb chain)", labels: ["in window", "400 kb", "2 Mb", "4 Mb"], values: [3, 129, 5, 31] }],
      { x: 7.3, y: 1.4, w: W - M - 7.3, h: 5.0, barDir: "col", chartColors: [C.gold, C.navy], fontFace: FONT, showLegend: true, legendPos: "t", legendFontSize: 11,
        showTitle: true, title: "Lifted gene items after panning away (log scale)", titleColor: C.navy, titleFontSize: 14, titleFontFace: FONT,
        valAxisLogScaleBase: 10, valAxisMinVal: 1, valAxisMaxVal: 1000, catAxisLabelColor: C.muted, valAxisLabelColor: C.muted,
        valGridLine: { color: C.hair, size: 0.5 }, catGridLine: { style: "none" }, showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: C.ink });
    notes(s, "Backup: how on-demand chains still let users pan and zoom.");
  }
  {
    const s = light("Backup: by the numbers");
    const items = [["148M", "nodes in the HPRC v2.0 Minigraph-Cactus graph"], ["94,554", "haplotype paths indexed (non-filtered graph)"],
      ["~11 GB", "GBWT FastLocate structure"], ["1.78 GB", "routing table (a naive all-pairs table: 17.2 TB)"],
      ["35 min", "routing table build at 32 threads"], ["~250 GB", "RAM for the running service"],
      ["15 lines", "changed in kent core, across 3 files"], ["385", "browser-side tests passing"]];
    const cw = (W - 2 * M - 0.9) / 4, chh = 2.2;
    items.forEach(([a, b], i) => { const x = M + (i % 4) * (cw + 0.3), y = 1.5 + Math.floor(i / 4) * (chh + 0.35);
      card(s, x, y, cw, chh); body(s, a, x, y + 0.35, cw, 0.8, { fontSize: 32, bold: true, color: C.navy, align: "center", valign: "middle" });
      body(s, b, x + 0.25, y + 1.2, cw - 0.5, 0.9, { fontSize: 13, color: C.muted, align: "center" }); });
    notes(s, "Backup: sizes and costs for questions about what it takes to run this.");
  }

  await pres.writeFile({ fileName: OUT });
  console.log("wrote", OUT);
})().catch(e => { console.error(e); process.exit(1); });
