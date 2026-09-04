# HPRC 2026 talk: design, script, and delivery notes (v5)

**Slot:** 15 minutes. The script runs about 12:55 including two ~45 s screen recordings, leaving room for the room.
**Deck:** `HPRC2026_talk.pptx`, 20 main slides (17 distinct, slide 8 is four builds) + 5 backup. Speaker notes are on every slide; the script below is generated from them, so the two cannot drift.
**Audience:** HPRC scientists. The point is not that a browser tool got better; the point is that the release 2 assemblies and graph become directly queryable. Speak of release 2 as their resource. No implementation detail (code, servers, browser internals) belongs in the talk.

---

## 1. The one sentence

> HPRC release 2 is the most complete picture of human variation we have, and until now querying it meant a large index, real compute, and command-line work most clinicians and many researchers cannot do. One index over the release 2 graph lets anyone search it with a sequence, or move a known locus and its annotation onto any of the 464 haplotypes, interactively.

## 2. The arc

| # | Slide | Budget | Elapsed |
|---|---|---|---|
| 1 | Title | 0:15 | 0:15 |
| 2 | 464 haplotypes; 2 hold almost everything we know | 0:45 | 1:00 |
| 3 | Possible on release 2, only in a terminal | 0:55 | 1:55 |
| 4 | Two use cases on the release 2 graph | 0:40 | 2:35 |
| 5 | Two capabilities on one index of the release 2 graph | 0:35 | 3:10 |
| 6 | Indexing a pangenome forced a trade-off | 0:35 | 3:50 |
| 7 | Tag arrays: an index that knows the graph | 0:40 | 4:30 |
| 8 | Translating a region is a walk, not a lookup (4 build slides) | 1:20 | 5:50 |
| 9 | Use case 1: a sequence that is not in GRCh38 | 1:20 | 7:10 |
| 10 | What this enables on release 2 | 0:35 | 7:45 |
| 11 | Moving a locus onto a release 2 haplotype today | 0:35 | 8:20 |
| 12 | Use case 2: a known gene, on HG02015 | 1:40 | 10:00 |
| 13 | What this enables on release 2 | 0:35 | 10:35 |
| 14 | Who this is for | 0:40 | 11:15 |
| 15 | Fast enough to sit behind a web page | 0:45 | 12:00 |
| 16 | Release 2, queryable | 0:40 | 12:40 |
| 17 | Thank you | 0:15 | 12:55 |

Why this order: release 2 comes first, as the audience's own resource, with the gap stated honestly: the tools exist (giraffe, odgi, r-index, halLiftover, impg), but each needs a large index, compute, and a terminal workflow that most clinicians and many researchers cannot use. Never say "no tools exist"; the room wrote them. The two use cases are planted before the method so the method has a purpose. Tag arrays get three slides because they are the contribution everything rests on. Each use case is a recording you narrate, followed by one "what this enables" slide. Existing browser tools and chain counts appear only where they explain why use case 2 was not possible before.

## 3. Script

Timings are cumulative. Stage directions in *italics*. Everything below is also in the slide notes.

### 1. Title (0:00 to 0:15)

"Thank you. I'm Parsa Eskandar, from Benedict Paten's lab at UC Santa Cruz. This is joint work with Jouni Sirén and the UCSC Genome Browser team, and it is about making the release 2 assemblies something a scientist can query directly."

### 2. 464 haplotypes; 2 hold almost everything we know (0:15 to 1:00)

"HPRC release 2 is the most complete picture of human variation we have: 464 haplotypes, in one graph. Two of those haplotypes, GRCh38 and CHM13, carry almost everything we know about the human genome: the gene models, the clinical variants, the regulatory annotation, and everyone's own tracks.
(pause)
The tools to work with the graph exist: vg giraffe maps to it, odgi and the r-index query it, halLiftover and impg move coordinates across it. But every one of them wants a large index on disk, real compute, and a command-line workflow that takes time to set up and time to run. A clinician, or a researcher outside a genomics group, never gets past that step. So in practice release 2 is browsed, one assembly at a time, and the graph itself goes unused. This talk is about removing that barrier."

### 3. Possible on release 2, only in a terminal (1:00 to 1:55)

"Concretely, three things release 2 can already do, but only from the command line.
Place a sequence across haplotypes: which of the 464 carry it, where, and what does each region look like? Today that is a giraffe index, a mapping run, and a terminal session before the first answer.
Move a locus onto a haplotype: take coordinates known on GRCh38 or CHM13 to an arbitrary release 2 haplotype. Today that is halLiftover or impg over the whole alignment, per request, or a ready-made chain for the handful of pairs that have one.
And bring the annotation along: see the reference's gene models, ClinVar, GWAS, or your own tracks on a release 2 haplotype. Today you lift every track yourself, per haplotype, before anyone can look.
None of this is impossible. The graph already holds the answers. Reaching them takes compute, disk, and bioinformatics expertise that most clinicians and many researchers do not have, and time that even the experts would rather spend elsewhere."

### 4. Two use cases on the release 2 graph (1:55 to 2:35)

"I will follow two use cases through the rest of the talk.
Use case 1, sequence search. A researcher has a sequence that is not in GRCh38: an insertion assembled from a sample, a probe, a contig. Which release 2 haplotypes carry it, and where on each?
Use case 2, coordinate translation. A researcher knows a gene on GRCh38 or CHM13 and wants to see it, with its annotation, on a specific release 2 haplotype.
Today the first means a giraffe index and a terminal session; the second, a ready-made chain for a few assembly pairs and a halLiftover run for every other one. Both are shown live, in a web page, on the release 2 graph in this talk."

### 5. Two capabilities on one index of the release 2 graph (2:35 to 3:10)

"What we built, in one picture. One index over the HPRC release 2 graph, a tag-array index, which I will explain in a moment. Every position in the BWT knows its graph position, and every node knows every haplotype crossing it.
Two capabilities sit on top of it. Sequence search: a sequence is mapped once, to the whole graph, every haplotype that carries it is reported, and the hit can be viewed on any of them. Coordinate translation: a locus on any haplotype is translated to any other, and the source's annotation is drawn there over an alignment built on demand.
Both run inside the UCSC Genome Browser, on the release 2 graph, today."

### 6. Indexing a pangenome forced a trade-off (3:15 to 3:50)

"A brief word on the index, because everything rests on it.
Indexing a pangenome used to force a choice. An FM-index on the haplotype sequences is simple and lossless, but reports the same seed once per haplotype. An FM-index on the graph deduplicates, but needs graph transformations that are fragile and can lose parts of haplotypes. Minimizer indexes are fast, but the seed length is fixed in advance.
Tag arrays take a different route: keep the FM-index on the haplotypes, and annotate the BWT with graph positions. Lossless, deduplicated, any seed length."

### 7. Tag arrays: an index that knows the graph (3:50 to 4:30)

"This is the idea on a toy graph, and it is all you need for the rest of the talk. Three haplotypes, indexed together. Alongside the index sits the tag array: for every position, the graph node it came from.
Three consequences. One index holds all 464 haplotypes, so a sequence is found once, however many haplotypes carry it. Every match knows its node, so a hit is a position in the graph, not a line in one assembly. And every node knows its haplotypes, so we can ask who passes through a node and get each haplotype with its own coordinate. That last one is what moves a locus from one haplotype to another.
Notice what is missing: nothing anywhere says CHM13-to-HG02015. There is no pairwise index, which is why any of the 464 can be translated to any other. The details are in the paper; I am happy to go into them in questions."

### 8. Translating a region is a walk, not a lookup (4:30 to 5:50; four slides, one step per click)

"With that one property in hand, translating a region stops being a lookup and becomes a walk. Four steps, one click each."
*click*
"One. Find the query interval's nodes on the source haplotype's path. The tag arrays give us those directly."
*click*
"Two. At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once, including the target we care about."
*click*
"Three. Nodes that source and target each visit exactly once are unambiguous anchors. Orthology is inherited from the graph's alignment; what we add is that a repeat cannot manufacture a false anchor, and a colinearity check drops pairs whose spans disagree."
*click*
"Four. Walk the graph between anchors, one base at a time, and group the bases that share an offset into blocks. A block breaks on an indel, never on a SNP; an inversion starts a new chain. That is exactly what a chain file means.
So the output is not a coordinate. It is a chain, and the browser already knows what to do with a chain. If the target does not contain the interval, you get fewer positions, never invented ones."

### 9. Use case 1: a sequence that is not in GRCh38 (5:50 to 7:10)

"Start the recording; narrate over it.
Use case 1: a sequence that is not in the reference. This is the Pangenome Mapping page.
The sequence is pasted and mapped once, to the whole release 2 graph, with vg giraffe, in a few seconds. The result is something no single-assembly search can give: exactly two of the 464 haplotypes carry this sequence, HG01167 hap1 and HG04157 paternal, and GRCh38 is not one of them. They are ranked by identity, with coverage beside it.
Selecting HG01167 opens it in the browser: the sequence is drawn as a track with base-level differences, in the context of that haplotype's own annotation. Selecting a different carrier re-uses the same alignment; nothing is remapped."

### 10. What this enables on release 2 (7:10 to 7:45)

"What this enables on release 2: one search across all 464 haplotypes instead of one assembly at a time; sequences absent from the reference are found on the haplotypes that carry them, together with how many carry them; and any carrier can be opened with the sequence as a track, with another carrier costing no remapping.
One detail this room will notice: MAPQ is zero by design. In a graph where every locus exists hundreds of times, mapping quality carries no information; per-haplotype identity and coverage replace it."

### 11. Moving a locus onto a release 2 haplotype today (7:45 to 8:20)

"Use case 2: a gene known on a reference, on a specific release 2 haplotype.
Moving a locus between assemblies today relies on a pairwise chain. The Genome Browser can draw one assembly's tracks on another, but only over a prebuilt chain between the two, and chains are built on request, one pair at a time. 464 haplotypes are more than two hundred thousand pairs; chains exist for fifty-six of them. For an arbitrary release 2 haplotype, such as HG02015, no chain exists.
The graph already contains the alignment for every pair. It has to be usable on demand, and that is exactly what the walk I showed produces."

### 12. Use case 2: a known gene, on HG02015 (8:20 to 10:00)

"Start the recording; slow down at the landing.
Now the same request on the release 2 graph. Source: the gene as known on the reference, here HLA-DMA on CHM13, ten kilobases on chromosome 6; GRCh38 is a path in this graph too, so it works identically as the source. Target: HG02015 paternal, chosen from all 464; the picker can be restricted to haplotypes that contain the region.
Translated in about a hundred milliseconds, covering a hundred percent of bases.
Opening the result is the part I care about most. HG02015 has its own CAT and Liftoff genes from release 2. What it does not have is everything that exists once, on one reference: ClinVar, the GWAS catalog, ENCODE, a lab's own tracks. Here they are, drawn at their translated positions, with the differences between the two assemblies marked.
(pause) The alignment that made this possible did not exist a second before the page loaded. It was built from the graph for this region and this haplotype, and the browser drew the tracks over it."

### 13. What this enables on release 2 (10:00 to 10:35)

"Before, a locus could be moved only between assembly pairs with a prebuilt chain, and a release 2 haplotype without one showed only its own tracks. Now any of the 464 haplotypes can be the target, from GRCh38 or CHM13, in about a hundred milliseconds; the reference's tracks are drawn there over an alignment built for that region, with the differences marked.
The thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. With this, any release 2 haplotype can borrow them for the region under study."

### 14. Who this is for (10:35 to 11:15)

"Who is this for? For clinicians and curators: is this insertion private to my patient, or carried by HPRC individuals, and which ones? ClinVar and GWAS context on the haplotype that actually carries the patient's allele. And the complex loci where one reference misleads: HLA, KIR, CYP2D6, LPA, SMN, seen on many haplotypes with the reference annotation drawn there.
For researchers and graph builders: place contigs, probes, primers or guide RNAs on every haplotype at once; move any annotation, including your own tracks, onto any assembly; and inspect the graph's alignment itself, because the Alignment Differences track is the graph, drawn base by base.
No pipeline, no download. A browser tab, and a sequence or a position."

### 15. Fast enough to sit behind a web page (11:15 to 12:00)

"None of this matters if it takes a minute. So: is it fast enough to sit behind a web page?
Exon-scale intervals translate in about twenty milliseconds, a ten-kilobase gene in about a tenth of a second, a hundred kilobases in under a second, a megabase in about four.
And it serves many people at once: throughput goes from six to sixty queries a second and saturates around eight cores. Read that as "one box serves about sixty queries a second", not as perfect scaling; the single-thread number was warm-up-limited."

### 16. Release 2, queryable (12:00 to 12:40)

"So, the two use cases. Sequence search: every carrying haplotype found in seconds, and the sequence viewed as a track on any of them. Coordinate translation: any of the 464 haplotypes as the target in about a hundred milliseconds, with the reference's annotation drawn there.
Release 2 becomes something a scientist can query, not only browse. The next step is the public UCSC Genome Browser. It is available on the development browser now; bring us your hardest region.
(Advance to thanks. Let it breathe. Then questions.)"

### 17. Thank you (12:40 to 12:55)

"None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you. Questions."

## 4. Delivery notes

- **Open cold.** First sentence: "HPRC release 2 is the most complete picture of human variation we have: 464 haplotypes, in one graph."
- **Recordings.** Two clips of 30 to 45 s each, no audio, browser zoom 125%, bookmarks bar hidden. Drop them in as `talk/figures/videos/scenario1.mp4` and `scenario2.mp4` and rebuild (`cd talk/build && node build.js`), or Insert > Video onto the placeholder. Set Playback to start automatically. Keep the static screenshots (slides 10 and 13) as your fallback if the venue laptop misbehaves.
  - Use case 1: paste the sequence on Pangenome Mapping > Submit > results card > click the HG01167 row > browser opens with the Pangenome Seq track.
  - Use case 2: Convert Coordinates page with source and region pre-filled > pick HG02015 paternal > Convert > click the result link > hgTracks with lifted tracks and Alignment Differences > pan once.
  - If you want use case 2 to literally start from GRCh38, record it with hg38 as the source; the deck needs no change.
- **One pause per slide.** Slide 2 after "GRCh38 and CHM13." Slide 12 after "did not exist a second before the page loaded."
- **Hard caps where you will run long:** slide 7 (1:05), slide 8 (1:25), slide 12 (1:45).
- **Numbers to know cold:** 464 haplotypes (CHM13 and GRCh38 included), 56 chains of 200,000+ pairs, 148M nodes; index: 2.6 Tbp, 26 B tag runs, 149 GiB, 23 GiB sampled; ~20 ms for ≤1 kb, 115 ms at 10 kb, 0.6 s at 100 kb, 4.3 s at 1 Mb; ~60 queries/s per server.
- **Vocabulary:** "release 2" means the HPRC release 2 assemblies and graph, never our software. "Haplotype" for the 464; never 466; never "genome" for the 464. "Use case 1 / use case 2", not stories or personas.
- **QuickLift facts** (UCSC 2026 update): View > In Other Genomes, tick "QuickLift tracks"; needs a prebuilt liftOver chain, "such alignments can be created by UCSC upon request"; showcase is hg38 to hs1; differences shown as vertical bars. Speak of it with respect: our tool uses its renderer.
- **Emergency cut order:** (1) slide 10, say two sentences at the end of the use case 1 recording instead, 35 s; (2) slide 6, go straight to "tag arrays annotate the BWT", 35 s; (3) the throughput chart on slide 15, one sentence instead, 25 s. Never cut 7, 8, 9, 11, 12, 14.

## 5. Who this helps: applications

**Clinicians and variant curators**
- Private or shared? Paste a patient's assembled insertion or SV breakpoint sequence and see which HPRC haplotypes carry it, and how many. A sequence carried by dozens of healthy haplotypes reads very differently from one carried by none.
- Context on the right genome. Take a ClinVar or GWAS locus from GRCh38 to the haplotype that actually carries the patient's allele, with the reference annotation drawn around it.
- Loci where one reference misleads: HLA and KIR, CYP2D6 and other pharmacogenes, LPA, SMN1/SMN2, the 1q21.1 and 16p11.2 segdup regions. See the same gene on many individuals without waiting for a chain to be made.
- Gene-panel and probe design: check that probes, primers or capture baits actually exist on the haplotypes a population carries.

**Researchers**
- Population presence of any sequence: an allele, a transposon insertion, a viral integration, a de novo assembly contig, placed on every haplotype at once, ranked by identity and coverage.
- Annotation transfer without a chain library: bring any reference track, or your own BED, onto any of the 464 haplotypes for the region you are studying, in the browser you already use.
- Cross-individual comparison of a locus: open the same gene on several haplotypes with the reference's tracks lifted to each, and read the Alignment Differences track as a base-level diff.
- CRISPR and primer design across the pangenome: find guides and primers that are present, or absent, on specific haplotypes.

**Graph builders and the consortium**
- The Alignment Differences track is the graph's alignment drawn base by base: an interactive way to inspect Minigraph-Cactus decisions at a locus.
- New graphs and releases plug in by building one index; nothing is tied to release 2.
- The two-phase chain widening and per-haplotype identity are reusable pieces for other pangenome-aware browser features.

## 6. Questions to expect

**"halLiftover already does any-to-any on the same Cactus alignment, and impg projects ranges in milliseconds. What's new?"**
Nothing about the alignment: it is Cactus's, and where halLiftover and we disagree one of us has a bug, which is a comparison I am running, not a claim I am making. Three things differ. Access pattern: halLiftover wants the HAL, a large file and a batch tool; we answer from a resident index in about a tenth of a second for a gene, behind a web request. No alignment of the query: an interval goes in and blocks come out, through anchors both haplotypes visit exactly once. Output: chain-semantics blocks, so the browser's own QuickLift draws them with no new machinery, which is why the core change is fifteen lines. impg is the closest in spirit; it works from alignment records, we work from the graph index, which is what gives all 464 haplotypes from one query.

**"How is this different from QuickLift?"**
It is QuickLift. Same renderer, same trackDb settings, same difference marks. QuickLift needs a prebuilt liftOver chain for the pair, made on request; we produce that chain on demand from the graph, for any pair of the 464 haplotypes, in about a tenth of a second for a gene.

**"What is your accuracy, and what happens in segdups and centromeres?"**
Structurally: an anchor is a node visited exactly once by both paths, so a repeat can't create a false anchor; a colinearity gate drops pairs whose spans disagree; the failure mode is a missing position, not a wrong one. Orthology itself is the graph's: a paralogy collapsed by Minigraph-Cactus is inherited. Measured: the Alignment Differences track is exact at base level where we checked; completeness is 99% at gene scale and 93% at 1 Mb; a segdup-dense span on 1q21.1 recovers 46%. Not yet measured at scale against an independent source; systematic comparisons against halLiftover on the same Cactus alignment, against the existing chains, and against a haplotype's own CAT annotation are under way and come before public release.

**"How does the tag array relate to the r-index and the GBWT?"**
The r-index over the haplotype sequences finds where a string occurs. The tag array annotates each BWT position with its graph position, stored run-length, so a BWT interval maps to distinct graph positions with two rank queries. For translation, a sampled tag array (tags at node starts only, 23 GiB) plus the r-index enumerate every haplotype and offset at a graph position. No pairwise structure anywhere.

**"Can I call this from my pipeline? Can I use my own graph or assemblies?"**
Pipeline: not yet, honestly; it is JSON over HTTP and the browser is just a client, but there is no documented or stable endpoint. A public API is on the plan. Own graph: yes, one index build per GBZ; nothing is release-specific. GRCh38 is already a path in this graph, so hg38 as a source works now. Own assemblies: to be a target, an assembly has to be in the graph. Own annotations: anything QuickLift can draw travels over the chain; I want to verify that for track hubs before promising it.

**"Why not just precompute all the chains?"**
464 × 463 is more than 200,000 chains, a large standing cost for pairs almost nobody asks for. On-demand generation makes arbitrary regions and arbitrary pairs possible today, and caching widened chains across users gets popular regions most of the benefit without the cost.

**"Is identity the same as BLAT identity?"**
No. It is per haplotype: of the read bases aligned to the graph, the fraction lying on nodes that haplotype visits and matching there. Soft-clipped ends are excluded, so a partial hit can look better than it is; we show coverage alongside identity for that reason. MAPQ is 0 by design in a graph where every locus exists hundreds of times.

**"What does it cost to run?"**
One service with the graph, r-index, tag arrays and GBWT loaded, on the order of 250 GB of RAM, serving all users.

**"When can I use it?"**
It runs on the development browser now. Public release is the next milestone, after the validation comparisons above.
