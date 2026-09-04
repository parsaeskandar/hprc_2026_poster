# HPRC 2026 talk: design, script, and delivery notes (v3)

**Slot:** 15 minutes. The script runs about 14:25 including two ~45 s screen recordings; the cut order in section 4 gets it to 12:00 if the slot is 12 + 3.
**Deck:** `HPRC2026_talk.pptx`, 18 main slides + 5 backup. Speaker notes are on every slide; this file is the long form.
**Audience:** the HPRC meeting. Everyone builds or uses pangenome graphs. Do not explain what a pangenome is. Do explain what is new: web latency, any pair, no alignment step, inside the browser everyone uses.

---

## 1. The one sentence

> Release 2 gave us 464 haplotypes and the browser no way to move knowledge between them. One tag-array index over the graph lets the UCSC Genome Browser search any sequence and lift any region to any haplotype, live.

## 2. The arc

| # | Slide | Job | Budget | Elapsed |
|---|---|---|---|---|
| 1 | Title | | 0:15 | 0:15 |
| 2 | 464 assemblies. 56 chain files. | Cold open: the gap, in a tool they use | 0:45 | 1:00 |
| 3 | Why release 2 is hard to use in the browser | The challenge, three reasons | 1:00 | 2:00 |
| 4 | One researcher, two afternoons | The two scenarios the talk will resolve | 0:45 | 2:45 |
| 5 | One index over the graph, two tools | What we built, in one picture | 0:35 | 3:20 |
| 6 | Indexing a pangenome forced a trade-off | Why tag arrays exist | 0:45 | 4:05 |
| 7 | Tag arrays: every BWT position knows its node | What they are; the query; the scale | 1:00 | 5:05 |
| 8 | From tags to translation: a walk, not a lookup | Your toy example, four steps | 1:00 | 6:05 |
| 9 | Scenario 1: recording | Pangenome Mapping, narrated over the video | 1:30 | 7:35 |
| 10 | Scenario 1: what that changes | Before / now | 0:35 | 8:10 |
| 11 | Scenario 2, today: QuickLift | What exists, and where it stops | 0:35 | 8:45 |
| 12 | Scenario 2: recording | Convert and land with annotations, narrated | 1:40 | 10:25 |
| 13 | Scenario 2: what that changes | Before / now | 0:35 | 11:00 |
| 14 | Who this is for | Clinicians, researchers, graph builders | 0:45 | 11:45 |
| 15 | Checked so far, and fast enough | Trust and speed, one slide | 0:50 | 12:35 |
| 16 | Real limits, and what's next | Honesty and the path to public release | 0:55 | 13:30 |
| 17 | Both afternoons, served | Close, then the ask | 0:40 | 14:10 |
| 18 | Thank you | | 0:15 | 14:25 |

Why this order: the challenge comes first and is stated in the room's own terms (references, BLAT, chains). The two afternoons are planted before the method so the method has a purpose. Tag arrays get three slides, brief but real, because they are the contribution everything rests on. Each scenario is a recording you narrate, followed by one before/now slide. Scenario 2 starts with QuickLift on purpose: naming it with respect turns the solution into the missing piece rather than a rival.

## 3. Script

Timings are cumulative. Stage directions in *italics*. Everything below is also in the slide notes.

### 1. Title (0:00 to 0:15)
"Thanks. I'm Parsa Eskandar, from Benedict Paten's lab at UC Santa Cruz, and this is joint work with Jouni Sirén and the UCSC Genome Browser team."

### 2. Cold open (0:15 to 1:00)
"HPRC release 2 is a remarkable resource, and the Genome Browser can open all 464 haplotype assemblies. The same database has 56 chain files.

*Two beats.*

Which means almost everything we know about the human genome, written in hg38 or CHM13, cannot move onto the other 462. You can look at them. You can't ask them anything. That is the problem this talk is about."

### 3. The challenge (1:00 to 2:00)
"Three reasons, and this room knows all three.

First, our knowledge lives on two references. ClinVar, GWAS, ENCODE, RefSeq, your own BED file: written once, in hg38 or CHM13 coordinates. Release 2 gives each haplotype CAT and Liftoff genes, and that's where it stops.

Second, sequence search is single-assembly. BLAT runs against one assembly and knows nothing about the graph. It cannot tell you which haplotypes carry your sequence, or how common it is.

Third, lift-over needs a chain per pair. QuickLift, shipped last year, is a great tool: it draws one assembly's tracks on another. But only over a prebuilt chain, made on request. 464 haplotypes is more than two hundred thousand pairs. The browser has fifty-six.

The graph is, by construction, the alignment of all 464 at once. In the browser, it has been a file, not a tool."

### 4. One researcher, two afternoons (2:00 to 2:45)
"Let me make this concrete with one researcher and two afternoons.

First afternoon: she has assembled an insertion from a patient's long reads, and it is not in GRCh38. Which HPRC haplotypes carry it? How common is it? What does the neighbourhood look like on a genome that actually has it? Today her tool is BLAT, one assembly at a time, and it can't tell her who else carries the sequence.

Second afternoon: she's curating a gene on GRCh38, ClinVar and the GWAS catalog open, and she wants that locus on one HPRC individual. Today her tool is QuickLift, and it works only where a chain already exists.

By the end of this talk: both afternoons, in the browser, in seconds."

### 5. What we built (2:45 to 3:20)
"Here is what we built, in one picture. One index over the HPRC v2.0 graph: the tag-array index, which I'll explain in a moment. Every position in the BWT knows its graph position, and every node knows every haplotype crossing it.

Two tools sit on top of it in the browser. Pangenome Mapping: paste a sequence, get every haplotype that carries it, land on any of them as a track. Rapid lift-over: pick any of the 464 haplotypes, a chain is built on the spot, and the reference's tracks follow you.

Both run as one service behind the browser. The browser itself changed by fifteen lines."

### 6. The indexing dilemma (3:20 to 4:05)
"A brief word on the index, because everything rests on it.

Indexing a pangenome used to force a choice. An FM-index on the haplotype sequences is simple and lossless, but reports the same seed once per haplotype. An FM-index on the graph deduplicates, but needs graph transformations that are fragile and can lose parts of haplotypes. Minimizer indexes are fast, but the seed length is fixed in advance.

Tag arrays take a different route: keep the FM-index on the haplotypes, and annotate the BWT with graph positions. Lossless, deduplicated, any seed length."

### 7. Tag arrays (4:05 to 5:05)
"Here is the whole idea on a toy graph. Three haplotypes, one BWT over their sequences. The tag array runs alongside the BWT: for every BWT position, the graph node and offset it came from.

A query is two steps. The r-index finds the BWT interval for a pattern, exactly as an FM-index would. Then two rank queries on the run-length tag structure return the distinct graph positions in that interval. No scan, no decompression, and no redundancy: one hit per graph position, however many haplotypes share it.

It stays small because similar suffixes sit together, so tags come in long runs. From v1.1 to v2.0 the sequence grew fivefold; the tag runs only doubled. We build it per chromosome and merge through the multi-string BWT. For the release 2 graph: 464 haplotypes, 2.6 terabases of sequence, 26 billion tag runs, 149 gigabytes, plus a 23 gigabyte sampled tag array that serves coordinate translation."

### 8. From tags to translation (5:05 to 6:05)
"And the same structure gives us coordinate translation, without a single pairwise table.

Take the orange haplotype from position 3 to 7, and ask where that lands on purple. One: walk the interval backwards with the r-index and collect the sampled tags it passes: nodes b, e and f. Two: for each tag, the sampled tag array lists every haplotype standing at that graph position, so we learn purple is on b and on f. Three: nodes both haplotypes visit exactly once anchor the two paths. Four: walk both paths between the anchors and emit offsets. Orange 3 maps to purple 3, orange 6 to purple 6, and orange 5 sits on node e, which purple never visits: no position, never a wrong one.

Nothing anywhere says orange-to-purple. Any haplotype to any haplotype, from one index. And the output has chain semantics, so the browser's existing lift-over renderer can draw it."

### 9. Scenario 1, recording (6:05 to 7:35)
*Start the video. Narrate over it; do not read the bullets.*

"First afternoon. This is the Pangenome Mapping page, BLAT for the pangenome.

She pastes the insertion. It is mapped once, to the whole graph, with vg giraffe, in a few seconds. And here is what BLAT could never have told her: exactly two of the 464 haplotypes carry this sequence, HG01167 hap1 and HG04157 paternal, and GRCh38 is not one of them. They're ranked by identity, with coverage beside it.

She clicks HG01167. No special page: she lands in the browser, on a genome that actually has her insertion, with the sequence as a native track, base-level differences colored the way BLAT users already know, and that haplotype's own annotation around it.

Picking a different carrier re-surjects the same alignment; nothing is remapped."

### 10. Scenario 1, what that changes (7:35 to 8:10)
"So, what does that change on release 2? Before: BLAT one assembly at a time, with 464 to choose from and no way to know which; a sequence missing from hg38 was simply unmapped; nothing told you who else carried it. Now: one search against the whole graph returns every carrying haplotype, ranked. Sequences absent from the reference are found where they actually live. You land on any carrier as a native track, and re-surjecting to another haplotype costs nothing.

One detail this room will notice: MAPQ is zero by design. In a graph where every locus exists hundreds of times, mapping quality carries no information; per-haplotype identity and coverage replace it."

### 11. Scenario 2, today (8:10 to 8:45)
"Second afternoon. She has a gene open on a reference, ClinVar and GWAS beside it, and she wants that locus on one HPRC individual.

The browser already has the right tool: QuickLift. View, In Other Genomes, tick QuickLift tracks, and your tracks are drawn on the other assembly with the differences marked. It is superb for hg38 to hs1.

But it needs a prebuilt chain between the two assemblies, made on request. Between HPRC haplotypes the browser has fifty-six, out of more than two hundred thousand pairs. She picks HG02015. There is no chain. Dead end.

The renderer is ready. What's missing is a chain for any pair, on demand. That is exactly what the walk I just showed you produces."

### 12. Scenario 2, recording (8:45 to 10:25)
*Start the video. Slow down at the landing.*

"Now the same afternoon with our tool. Source: the gene she was looking at, here HLA-DMA on CHM13, ten kilobases on chromosome 6; GRCh38 is a path in this graph too, so hg38 works exactly the same way. Target: HG02015 paternal, the haplotype that was a dead end a minute ago.

Translated in about a hundred milliseconds. A hundred percent of bases.

She clicks the result, and this is the part I care about most. HG02015 has its own CAT and Liftoff genes from release 2. What it will never have is everything that exists once, on one reference: ClinVar, the GWAS catalog, ENCODE, her own BED file. And here they are, drawn at their translated positions, with the differences marked the way QuickLift users already read them.

*Pause.* The chain that made this possible did not exist a second before the page loaded. The translation blocks became a bigChain; the browser's own QuickLift renderer drew the tracks. Same QuickLift. The chain just isn't prebuilt anymore."

### 13. Scenario 2, what that changes (10:25 to 11:00)
"Before: lift-over only between pairs with a prebuilt chain, fifty-six of two hundred thousand, new ones made on request, and a haplotype without a chain showed only its own tracks. Now: any of the 464 haplotypes as the target, from hg38 or CHM13, in about a hundred milliseconds; the chain is built for the region you're looking at and reused as you pan; the reference's tracks come along with the differences marked; and it's in the ordinary hgConvert menu too.

That is what I mean by making release 2 useful: the thousands of tracks that exist once, on one reference, will never be rebuilt 464 times. Any haplotype can borrow them, on demand."

### 14. Who this is for (11:00 to 11:45)
"Who is this for? For clinicians and curators: is this insertion private to my patient, or carried by HPRC individuals, and which ones? ClinVar and GWAS context on the haplotype that actually carries the patient's allele. And the complex loci where one reference misleads, HLA, KIR, CYP2D6, LPA, SMN, seen on many haplotypes with the reference annotation drawn there.

For researchers and graph builders: place contigs, probes, primers or guide RNAs on every haplotype at once; move any annotation, including your own tracks, onto any assembly; and inspect the graph's alignment itself, because the Alignment Differences track is the graph, drawn base by base.

No pipeline, no download. A browser tab, and a sequence or a position."

### 15. Checked and fast (11:45 to 12:35)
"Trust before speed, and I want to be straight about which numbers I have. Checked: the Alignment Differences track, base by base across 22 kb of ABO, exactly the two real mismatches; completeness 99% at gene scale and 93% at a megabase; and one hard case, a segdup-dense span on 1q21.1 recovering about half its bases. Missing positions, never wrong ones. Not yet: halLiftover on the same Cactus alignment, the 56 existing chains, and CAT transcripts against a haplotype's own annotation. Those come before public release.

Speed: exon-scale intervals in about twenty milliseconds, a ten-kilobase gene in a tenth of a second, a megabase in about four, and one server sustains about sixty queries a second."

### 16. Limits and next (12:35 to 13:30)
"Two things I want to be honest about. Chains are built per view, so if you pan far enough we build another one. And wide, segdup-dense spans lose positions: on 1q21.1 we recover about half. Missing, not wrong. This runs on the development browser, as one service with about 250 gigabytes of RAM, and there is no public API yet.

Next: chains that persist and are shared across users; better recovery in segdups; a documented JSON API, because half of you will want this from a pipeline; and more graphs, since nothing here is specific to release 2.

And the milestone all of that serves: the public UCSC Genome Browser."

### 17. Both afternoons, served (13:30 to 14:10)
"So, back to her two afternoons. The insertion that isn't in GRCh38: two carriers found in seconds, and mapped as a track on a genome that has it. The gene she knew on a reference: on HG02015 in a tenth of a second, with the reference's tracks drawn around it, over a chain that didn't exist until she asked.

It's live on the development browser today. So bring me your hardest region, and tell me where it breaks."

*Advance to thanks. Let it breathe. Then questions.*

### 18. Thanks (14:10 to 14:25)
"None of this was mine alone: Jouni Sirén, Benedict Paten, and a lot of help from the Computational Genomics Lab and the Genome Browser team. Thank you."

## 4. Delivery notes

- **Open cold.** First sentence: "HPRC release 2 is a remarkable resource, and the Genome Browser can open all 464 haplotype assemblies."
- **Recordings.** Two clips of 30 to 45 s each, no audio, browser zoom 125%, bookmarks bar hidden. Drop them in as `talk/figures/videos/scenario1.mp4` and `scenario2.mp4` and rebuild (`cd talk/build && node build.js`), or Insert > Video onto the placeholder. Set Playback to start automatically. Keep the static screenshots (slides 10 and 13) as your fallback if the venue laptop misbehaves.
  - Scenario 1: paste the sequence on Pangenome Mapping > Submit > results card > click the HG01167 row > browser opens with the Pangenome Seq track.
  - Scenario 2: Convert Coordinates page with source and region pre-filled > pick HG02015 paternal > Convert > click the result link > hgTracks with lifted tracks and Alignment Differences > pan once.
  - If you want Scenario 2 to literally start from GRCh38, record it with hg38 as the source; the deck needs no change.
- **One pause per slide.** Slide 2 after "56 chain files." Slide 12 after "did not exist a second before the page loaded."
- **Hard caps where you will run long:** slide 7 (1:05), slide 8 (1:05), slide 12 (1:45).
- **Numbers to know cold:** 464 haplotypes (CHM13 and GRCh38 included), 56 chains of 200,000+ pairs, 148M nodes; index: 2.6 Tbp, 26 B tag runs, 149 GiB, 23 GiB sampled; ~20 ms for ≤1 kb, 115 ms at 10 kb, 0.6 s at 100 kb, 4.3 s at 1 Mb; ~60 queries/s per server; 46% recovered on 1q21.1; 15 lines in kent core; ~250 GB RAM.
- **Vocabulary:** "haplotype assembly" or "haplotype" for the 464. Never 466. Never "genome" for the 464.
- **QuickLift facts** (UCSC 2026 update): View > In Other Genomes, tick "QuickLift tracks"; needs a prebuilt liftOver chain, "such alignments can be created by UCSC upon request"; showcase is hg38 to hs1; differences shown as vertical bars. Speak of it with respect: our tool uses its renderer.
- **Emergency cut order:** (1) slide 10, say two sentences on slide 9 instead, 35 s; (2) slide 6, go straight to "tag arrays annotate the BWT", 45 s; (3) slide 14, keep the last line only, 35 s; (4) the last "Next" bullet on slide 16, 10 s. Never cut 7, 8, 11, 12, 15.

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
