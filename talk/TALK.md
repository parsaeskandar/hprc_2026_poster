# HPRC 2026 talk: design, script, and delivery notes (v4)

**Slot:** 15 minutes. The script runs about 14:50 including two ~45 s screen recordings; the cut order in section 4 brings it to about 12:30 if the slot is 12 + 3.
**Deck:** `HPRC2026_talk.pptx`, 19 main slides + 5 backup. Speaker notes are on every slide; the script below is generated from them, so the two cannot drift.
**Audience:** the HPRC meeting. Everyone builds or uses pangenome graphs. Do not explain what a pangenome is. Do explain what is new: web latency, any pair, no alignment step, inside the browser everyone uses.

---

## 1. The one sentence

> Release 2 gave us 464 haplotypes and the browser no way to move knowledge between them. One tag-array index over the graph lets the UCSC Genome Browser search any sequence and lift any region to any haplotype, live.

## 2. The arc

| # | Slide | Budget | Elapsed |
|---|---|---|---|
| 1 | Title | 0:15 | 0:15 |
| 2 | 464 assemblies. 56 chain files. | 0:45 | 1:00 |
| 3 | Two old tools. Both are single-pair. | 0:50 | 1:50 |
| 4 | Two users the browser can't serve today | 0:45 | 2:35 |
| 5 | One service, two engines, three pages | 0:45 | 3:15 |
| 6 | Indexing a pangenome forced a trade-off | 0:35 | 3:50 |
| 7 | Tag arrays: every BWT position knows its node | 1:00 | 4:50 |
| 8 | Translating a region is a walk, not a lookup | 1:20 | 6:10 |
| 9 | Story 1: a sequence GRCh38 doesn't have | 1:20 | 7:30 |
| 10 | What that changes on release 2 | 0:35 | 8:05 |
| 11 | Story 2, today: QuickLift needs a chain per pair | 0:35 | 8:40 |
| 12 | Story 2: the gene she knows, on HG02015 | 1:40 | 10:20 |
| 13 | What that changes on release 2 | 0:35 | 10:55 |
| 14 | Who this is for | 0:40 | 11:35 |
| 15 | What we have checked, and what we haven't | 0:45 | 12:20 |
| 16 | Fast enough to sit behind a web page | 0:45 | 13:05 |
| 17 | Real limits, and what's next | 0:55 | 14:00 |
| 18 | Both users, served | 0:35 | 14:35 |
| 19 | Thank you | 0:15 | 14:50 |

Why this order: the challenge comes first, in the room's own terms (two references, BLAT, chains). The two afternoons are planted before the method so the method has a purpose. Tag arrays get three slides, brief but real, because they are the contribution everything rests on. Each scenario is a recording you narrate, followed by one "what that changes" slide. Scenario 2 starts with QuickLift on purpose: naming it with respect turns the solution into the missing piece rather than a rival.

## 3. Script

Timings are cumulative. Stage directions in *italics*. Everything below is also in the slide notes.

### 1. Title (0:00 to 0:15)

"Thanks. I'm Parsa Eskandar, from Benedict Paten's lab at UC Santa Cruz, and this is joint work with Jouni Sirén and the UCSC Genome Browser team.
(Don't linger. Advance.)"

### 2. 464 assemblies. 56 chain files. (0:15 to 1:00)

"The UCSC Genome Browser can open 464 HPRC haplotype assemblies. The same database has 56 chain files.
(pause: two full beats, let them do the arithmetic)
Which means almost everything we know about the human genome is written in hg38 or CHM13, and for the other 462 there is no way to move any of it across. You can look at them. You can't ask them anything. That's this talk."

### 3. Two old tools. Both are single-pair. (1:00 to 1:50)

"For thirty years two tools have moved knowledge between genomes: alignment and lift-over. Neither is broken. Both are single-pair.
(point left) BLAT runs against one assembly. There are 464 now.
(point right) A chain covers one ordered pair. Two hundred thousand possible pairs; the browser has fifty-six.
And yes, this room can already query the graph: giraffe, the r-index, odgi, halLiftover on the Cactus alignment. From a shell, in seconds to minutes, by people who write shell.
What has not existed is that capability at web latency, for any pair, inside the tool everyone else uses. In the browser, the graph has been a file, not a tool."

### 4. Two users the browser can't serve today (1:50 to 2:35)

"Let me make this concrete with one researcher and two afternoons.
First afternoon: she has assembled an insertion from a patient's long reads, and it is not in GRCh38. Which HPRC haplotypes carry it? How common is it? What does the neighbourhood look like on a genome that actually has it? Today her tool is BLAT: one assembly at a time, and BLAT knows nothing about the graph, so it can't tell her who else carries the sequence.
Second afternoon: she's curating a gene on GRCh38, ClinVar and the GWAS catalog open, and she wants to see that locus on one HPRC individual. Today her tool is QuickLift, and QuickLift works only where a chain already exists. For most HPRC haplotypes, it doesn't.
Everyone in this room can serve her with enough shell. Nobody can do it from the browser, in seconds, for an arbitrary haplotype. By the end of this talk: both afternoons, live."

### 5. One service, two engines, three pages (2:30 to 3:15)

"Here's what we built to answer all three, and it fits on one slide. The browser talks to a service. The service holds two engines over the HPRC v2 graph: vg giraffe for mapping sequences, and our coordinate-translation index. Three pages in the browser, three things they do: search, translate, lift annotations.
Fifteen lines changed in the browser's core; everything else is a new page. Let me start with the one idea that makes translation possible at all."

### 6. Indexing a pangenome forced a trade-off (3:15 to 3:50)

"A brief word on the index, because everything rests on it.
Indexing a pangenome used to force a choice. An FM-index on the haplotype sequences is simple and lossless, but reports the same seed once per haplotype. An FM-index on the graph deduplicates, but needs graph transformations that are fragile and can lose parts of haplotypes. Minimizer indexes are fast, but the seed length is fixed in advance.
Tag arrays take a different route: keep the FM-index on the haplotypes, and annotate the BWT with graph positions. Lossless, deduplicated, any seed length."

### 7. Tag arrays: every BWT position knows its node (3:50 to 4:50)

"Here is the whole idea on a toy graph. Three haplotypes, one BWT over their sequences. The tag array runs alongside the BWT: for every BWT position, the graph node and offset it came from.
A query is two steps. The r-index finds the BWT interval for a pattern, exactly as an FM-index would. Then two rank queries on the run-length tag structure return the distinct graph positions in that interval. No scan, no decompression, no redundancy: one hit per graph position, however many haplotypes share it.
It stays small because similar suffixes sit together, so tags come in long runs: from v1.1 to v2.0 the sequence grew fivefold and the tag runs only doubled. We build it per chromosome and merge through the multi-string BWT. For release 2: 464 haplotypes, 2.6 terabases, 26 billion tag runs, 149 gigabytes, plus a 23 gigabyte sampled tag array that serves coordinate translation.
Notice what's missing: nothing anywhere says CHM13-to-HG02015. That is what makes any-to-any translation possible."

### 8. Translating a region is a walk, not a lookup (4:50 to 6:10)

"With that one property in hand, translating a region stops being a lookup and becomes a walk.
(1) Find the query interval's nodes on the source haplotype's path.
(2) At those nodes, ask the tag arrays who else is standing here. Every haplotype comes back at once.
(3) Nodes that source and target each visit exactly once are unambiguous anchors. Orthology is inherited from the graph's alignment. What we guarantee is that a repeat can't manufacture a false anchor, and a colinearity check drops pairs whose spans disagree.
(4) Walk the graph between anchors, one base at a time, and group the bases that share an offset into blocks. A block breaks on an indel, never on a SNP; an inversion starts a new chain. That is exactly what a chain file means.
So the output isn't a coordinate. It is a chain, and the browser already knows what to do with a chain. And if the target simply doesn't contain the interval, you get fewer positions, never invented ones."

### 9. Story 1: a sequence GRCh38 doesn't have (6:10 to 7:30)

"Start the recording; narrate over it.
First afternoon: the insertion that isn't in the reference. This is the Pangenome Mapping page, BLAT for the pangenome.
She pastes the insertion. It is mapped once, to the whole graph, with vg giraffe, in a few seconds. And here is what BLAT could never have told her: exactly two of the 464 haplotypes carry this sequence, HG01167 hap1 and HG04157 paternal, and GRCh38 is not one of them. Ranked by identity, with coverage beside it.
She clicks HG01167. No special page: she lands in the browser, on a genome that actually has her insertion, with the sequence as a native track, base-level differences colored the way BLAT users already know, and that haplotype's own annotation around it. Picking a different carrier re-surjects the same alignment; nothing is remapped."

### 10. What that changes on release 2 (7:30 to 8:05)

"So what does that change on release 2? Before, BLAT ran against one assembly at a time, with 464 to choose from and no way to know which; a sequence missing from hg38 was simply unmapped; nothing told you who else carried it. Now one search against the whole graph returns every carrying haplotype, ranked; sequences absent from the reference are found where they actually live; you land on any carrier as a native track, and re-surjecting to another haplotype costs nothing.
One detail this room will notice: MAPQ is zero by design. In a graph where every locus exists hundreds of times, mapping quality carries no information; per-haplotype identity and coverage replace it."

### 11. Story 2, today: QuickLift needs a chain per pair (8:05 to 8:40)

"Second afternoon. She has HLA-DMA open on a reference, ClinVar and GWAS beside it, and she wants that locus on one HPRC individual.
The browser already has the right tool for this: QuickLift, shipped last year. View, In Other Genomes, tick QuickLift tracks, and your tracks are drawn on the other assembly with the differences marked. It is superb for hg38 to hs1.
But QuickLift needs a prebuilt chain between the two assemblies, made by UCSC on request. Between HPRC haplotypes the browser has fifty-six, out of more than two hundred thousand pairs. She picks HG02015. There is no chain. Dead end.
The renderer is ready. What's missing is a chain for any pair, on demand. That is exactly what the walk from slide seven produces."

### 12. Story 2: the gene she knows, on HG02015 (8:40 to 10:20)

"Start the recording; slow down at the landing.
Now the same afternoon with our tool. Source: the gene she was looking at, here HLA-DMA on CHM13, ten kilobases on chromosome 6; GRCh38 is a path in this graph too, so hg38 works exactly the same way. Target: HG02015 paternal, the haplotype that was a dead end a minute ago; the picker can show only haplotypes that contain the region.
Translated in about a hundred milliseconds. A hundred percent of bases.
She clicks the result, and this is the part I care about most. HG02015 has its own CAT and Liftoff genes from release 2. What it will never have is everything that exists once, on one reference: ClinVar, the GWAS catalog, ENCODE, her own BED file. And here they are, drawn at their translated positions, with the differences marked the way QuickLift users already read them.
(pause) The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain; the browser's own QuickLift renderer drew the tracks. Same QuickLift. The chain just isn't prebuilt anymore."

### 13. What that changes on release 2 (10:20 to 10:55)

"Before: lift-over only between pairs with a prebuilt chain, fifty-six of two hundred thousand, new ones made on request, and a haplotype without a chain showed only its own tracks. Now: any of the 464 haplotypes as the target, from hg38 or CHM13, in about a hundred milliseconds; the chain is built for the region you're looking at and reused as you pan; the reference's tracks come along with the differences marked; and it's in the ordinary hgConvert menu too.
That is what I mean by making release 2 useful: the thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. Any haplotype can borrow them, on demand."

### 14. Who this is for (10:55 to 11:35)

"Who is this for? For clinicians and curators: is this insertion private to my patient, or carried by HPRC individuals, and which ones? ClinVar and GWAS context on the haplotype that actually carries the patient's allele. And the complex loci where one reference misleads: HLA, KIR, CYP2D6, LPA, SMN, seen on many haplotypes with the reference annotation drawn there.
For researchers and graph builders: place contigs, probes, primers or guide RNAs on every haplotype at once; move any annotation, including your own tracks, onto any assembly; and inspect the graph's alignment itself, because the Alignment Differences track is the graph, drawn base by base.
No pipeline, no download. A browser tab, and a sequence or a position."

### 15. What we have checked, and what we haven't (11:35 to 12:20)

"Before the numbers on speed, the numbers on trust, and which ones I actually have.
Checked: the Alignment Differences track, base by base, across 22 kb of ABO: exactly the two real mismatches, nothing invented. A correctness check, not a divergence estimate. Completeness by span: 99% at gene scale, 93% at a megabase. And one hard case: a segdup-dense span on 1q21.1 recovers about half its bases. Missing positions, not wrong ones: a repeat cannot manufacture an anchor.
Not yet: halLiftover on the same Cactus alignment, agreement with the 56 existing chains, and the one I care about most, CHM13's CAT transcripts onto a haplotype that has its own CAT annotation, exon boundary by exon boundary. Those three come before public release."

### 16. Fast enough to sit behind a web page (12:20 to 13:05)

"None of this matters if it takes a minute. So: is it fast enough to sit behind a web page?
Exon-scale intervals translate in about twenty milliseconds, a ten-kilobase gene in about a tenth of a second, a hundred kilobases in under a second, a megabase in about four.
And it serves many people at once: throughput goes from six to sixty queries a second and saturates around eight cores. Read that as "one box serves about sixty queries a second", not as perfect scaling; the single-thread number was warm-up-limited."

### 17. Real limits, and what's next (13:05 to 14:00)

"Two things I want to be honest about before I stop.
Chains are built per view, so if you pan far enough we build another one. And wide, segdup-dense spans lose positions: on 1q21.1 we recover about half. Missing, not wrong. This runs on the development browser, as one service with about 250 gigabytes of RAM, and there is no public API yet.
What's next. Chains that persist: right now a widened chain dies with your session; share it across users and popular regions are free after the first visit. Better recovery in segdups. A documented JSON API, because half of you will want this from a pipeline, not a browser. And more graphs: nothing here is specific to release 2; a new release plugs in by building one index.
And the milestone all of that serves: the public UCSC Genome Browser."

### 18. Both users, served (14:00 to 14:35)

"So, back to her two afternoons.
The insertion that isn't in GRCh38: two carriers found in seconds, and mapped as a track on a genome that has it. The gene she knew on a reference: on HG02015 in a tenth of a second, with the reference's tracks drawn around it, over a chain that didn't exist until she asked.
It's live on the development browser today. So bring me your hardest region, and tell me where it breaks.
(Advance to the thanks slide, let it breathe, then take questions.)"

### 19. Thank you (14:35 to 14:50)

"None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you. Questions."

## 4. Delivery notes

- **Open cold.** First sentence: "HPRC release 2 is a remarkable resource, and the Genome Browser can open all 464 haplotype assemblies."
- **Recordings.** Two clips of 30 to 45 s each, no audio, browser zoom 125%, bookmarks bar hidden. Drop them in as `talk/figures/videos/scenario1.mp4` and `scenario2.mp4` and rebuild (`cd talk/build && node build.js`), or Insert > Video onto the placeholder. Set Playback to start automatically. Keep the static screenshots (slides 10 and 13) as your fallback if the venue laptop misbehaves.
  - Scenario 1: paste the sequence on Pangenome Mapping > Submit > results card > click the HG01167 row > browser opens with the Pangenome Seq track.
  - Scenario 2: Convert Coordinates page with source and region pre-filled > pick HG02015 paternal > Convert > click the result link > hgTracks with lifted tracks and Alignment Differences > pan once.
  - If you want Scenario 2 to literally start from GRCh38, record it with hg38 as the source; the deck needs no change.
- **One pause per slide.** Slide 2 after "56 chain files." Slide 12 after "did not exist a second before the page loaded."
- **Hard caps where you will run long:** slide 7 (1:05), slide 8 (1:25), slide 12 (1:45).
- **Numbers to know cold:** 464 haplotypes (CHM13 and GRCh38 included), 56 chains of 200,000+ pairs, 148M nodes; index: 2.6 Tbp, 26 B tag runs, 149 GiB, 23 GiB sampled; ~20 ms for ≤1 kb, 115 ms at 10 kb, 0.6 s at 100 kb, 4.3 s at 1 Mb; ~60 queries/s per server; 46% recovered on 1q21.1; 15 lines in kent core; ~250 GB RAM.
- **Vocabulary:** "haplotype assembly" or "haplotype" for the 464. Never 466. Never "genome" for the 464.
- **QuickLift facts** (UCSC 2026 update): View > In Other Genomes, tick "QuickLift tracks"; needs a prebuilt liftOver chain, "such alignments can be created by UCSC upon request"; showcase is hg38 to hs1; differences shown as vertical bars. Speak of it with respect: our tool uses its renderer.
- **Emergency cut order:** (1) slide 10, say two sentences at the end of the Story 1 recording instead, 35 s; (2) slide 6, go straight to "tag arrays annotate the BWT", 35 s; (3) slide 14, keep the last line only, 40 s; (4) the throughput chart on slide 16, one sentence instead, 25 s. Never cut 7, 8, 9, 11, 12, 15.

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
Structurally: an anchor is a node visited exactly once by both paths, so a repeat can't create a false anchor; a colinearity gate drops pairs whose spans disagree; the failure mode is a missing position, not a wrong one. Orthology itself is the graph's: a paralogy collapsed by Minigraph-Cactus is inherited. Measured: the Alignment Differences track is exact at base level where we checked; completeness is 99% at gene scale and 93% at 1 Mb; a segdup-dense span on 1q21.1 recovers 46%. Not yet measured at scale against an independent source; the three comparisons on slide 15 come before public release.

**"How does the tag array relate to the r-index and the GBWT?"**
The r-index over the haplotype sequences finds where a string occurs. The tag array annotates each BWT position with its graph position, stored run-length, so a BWT interval maps to distinct graph positions with two rank queries. For translation, a sampled tag array (tags at node starts only, 23 GiB) plus the r-index enumerate every haplotype and offset at a graph position. No pairwise structure anywhere.

**"Can I call this from my pipeline? Can I use my own graph or assemblies?"**
Pipeline: not yet, honestly; it is JSON over HTTP and the browser is just a client, but there is no documented or stable endpoint. A public API is on the plan. Own graph: yes, one index build per GBZ; nothing is release-specific. GRCh38 is already a path in this graph, so hg38 as a source works now. Own assemblies: to be a target, an assembly has to be in the graph. Own annotations: anything QuickLift can draw travels over the chain; I want to verify that for track hubs before promising it.

**"Why not just precompute all the chains?"**
464 × 463 is more than 200,000 chains, a large standing cost for pairs almost nobody asks for. On-demand generation makes arbitrary regions and arbitrary pairs possible today, and caching widened chains across users (slide 16) gets popular regions most of the benefit without the cost.

**"Is identity the same as BLAT identity?"**
No. It is per haplotype: of the read bases aligned to the graph, the fraction lying on nodes that haplotype visits and matching there. Soft-clipped ends are excluded, so a partial hit can look better than it is; we show coverage alongside identity for that reason. MAPQ is 0 by design in a graph where every locus exists hundreds of times.

**"What does it cost to run?"**
One service with the graph, r-index, tag arrays and GBWT loaded, on the order of 250 GB of RAM. It serves all users; the browser CGI is stateless.

**"When can I use it?"**
It runs on the development browser now. Public release is the next milestone, after the three validation numbers on slide 15.
