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
