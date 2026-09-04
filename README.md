# HPRC 2026 Poster

LaTeX sources for my HPRC 2026 poster:

**A Pangenome Sequence Search and Coordinate Translation Service for the UCSC Genome Browser**
Parsa Eskandar, Jouni Sirén, Benedict Paten — UC Santa Cruz Genomics Institute

The poster covers the pangenome mapping / coordinate-translation service
(pangenome-index + vg giraffe-server) and its integration into the UCSC
Genome Browser (hgPangenome, on-the-fly QuickLift chains, Alignment
Differences track).

## Building

- **Overleaf**: this repo is Overleaf-synced; `main.tex` compiles with the
  default pdfLaTeX compiler.
- **Locally**: `tectonic main.tex` or `pdflatex main.tex`.

## Layout

- `main.tex` — the whole poster (beamerposter, 48in × 36in landscape;
  change the `beamerposter` options at the top for other sizes).
- `figures/` — screenshots and logos. See `figures/README.md` for the exact
  filenames; placeholder boxes in the poster are replaced automatically as
  soon as the files are dropped in.

## Talk

`talk/` holds the 15-minute HPRC 2026 talk built from the same material:

- `talk/HPRC2026_talk.pptx`: the deck (20 slides + 5 backup; slide 8 is four builds), speaker notes on every slide; drop screen recordings into `talk/figures/videos/` as `scenario1.mp4` and `scenario2.mp4` and rebuild to embed them.
- `talk/TALK.md`: narrative design, full timed script, delivery notes, and likely questions.
- `talk/build/build.js`: generator (`cd talk/build && npm install && node build.js`).
- `talk/figures/`: rendered figures and cropped screenshots (TikZ sources in `figures/src`).
