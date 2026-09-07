# HPRC 2026 talk: outline and notes (v7, simple)

**Slot:** 15 minutes. Fifteen slides plus three backup. Two screen recordings of 30 to 45 s each.
**Deck:** `HPRC2026_talk.pptx`. Slides carry figures and screenshots and almost no text. The speaker notes hold talking points only, not sentences: write the words yourself, in your own voice.

## 1. The order

1. Title
2. Not possible in the Genome Browser today: search across all haplotypes; lift-over to any haplotype; the reference annotation on a haplotype
3. Two use cases (sequence search; coordinate translation)
4. Use case 1: recording
5. Use case 1: result screenshot (two of 464 carry it; GRCh38 does not)
6. Use case 2: recording
7. Use case 2: result screenshot (reference tracks drawn on HG02015; no chain existed)
8. How: tag arrays, one index over the whole graph (your figure plus the BWT and tag columns)
9 to 12. Translating a region, one step per click
13. Speed (latency lollipop)
14. Next: public release; on the development browser now
15. Thanks
Backup: toy translation example; by the numbers

Rough budget: 2 minutes for slides 1 to 3, 5 minutes for the two use cases, 4 minutes for slides 8 to 12, 1 minute each for 13 and 14. That leaves two minutes of slack.

## 2. Talking points per slide

These are the same as the slide notes. Each is a fact or a cue, not a line to read.

- **2.** No search across haplotypes: BLAT is one assembly at a time. No lift-over to a haplotype without a prebuilt chain: 56 chains, 200,000+ pairs. The graph already aligns all 464; nothing in the browser uses it.
- **3.** Use case 1: a sequence not in the reference; which haplotypes carry it, and where. Use case 2: a locus known on GRCh38; see it on another haplotype with its annotation.
- **4.** Paste; map once to the whole graph; results ranked by identity; click one, the sequence is a track on that haplotype.
- **5.** HG01167 hap1 and HG04157 paternal; not GRCh38. One search instead of 464. MAPQ is 0 by design in a graph this redundant; identity and coverage carry the ranking.
- **6.** Source: the gene on the reference. Target: HG02015 paternal, any of 464. About 100 ms. Landing: reference tracks on HG02015, differences marked.
- **7.** Genes, ClinVar, your own tracks, on a haplotype that had no chain. Alignment Differences track: insertions, deletions, mismatches, base by base.
- **8.** One FM-index over all 464 haplotypes; a sequence is found once. The tag says which node and offset each BWT position came from, so a match is a graph position. From a node, every haplotype passing through it and where; that is what moves a locus. No pairwise anything.
- **9.** The query interval projected onto the source haplotype's path.
- **10.** At those nodes, every haplotype standing there, target included.
- **11.** A node both paths visit exactly once cannot be a false anchor. Orthology comes from the graph.
- **12.** Walk base by base; a block breaks on an indel, never a SNP; the output is a chain and the browser knows chains. Missing positions are possible, invented ones are not.
- **13.** A gene in a tenth of a second, a megabase in seconds, about 60 queries a second per server. Nothing precomputed per pair.
- **14.** What is done, what is planned. Invite people to try it on the development browser.

## 3. Recordings

Drop the clips in as `talk/figures/videos/scenario1.mp4` and `scenario2.mp4` and rebuild (`cd talk/build && node build.js`), or Insert > Video onto the placeholder. Browser zoom 125 to 150 percent, bookmarks bar hidden, no audio, 16:9.

- Use case 1: empty Pangenome Mapping page, paste, Map, wait, result table, rest on HG01167 hap1, click, browser view with the Pangenome Seq track, rest on a mismatch.
- Use case 2: Convert Coordinates page with the source region filled, pick HG02015 paternal, Convert, click the result, hgTracks with lifted tracks and Alignment Differences, one slow pan.
- Slides 5 and 7 are the static fallback if the venue laptop will not play video.

## 4. Numbers to know

464 haplotypes (CHM13 and GRCh38 included); 56 chains of 200,000+ pairs; 148M nodes. Index: 2.6 Tbp, 26 B tag runs, 149 GiB, 23 GiB sampled. Latency: ~20 ms up to 1 kb, 115 ms at 10 kb, 0.6 s at 100 kb, 4.3 s at 1 Mb; ~60 queries/s per server. Say "release 2" for the HPRC assemblies and graph, never for the software.

## 5. Questions to expect, with the facts to answer them

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
464 × 463 is more than 200,000 chains, a large standing cost for pairs almost nobody asks for. On-demand generation makes any region and any pair possible today, and caching widened chains across users gets popular regions most of the benefit without the cost.

**"Is identity the same as BLAT identity?"**
No. It is per haplotype: of the read bases aligned to the graph, the fraction lying on nodes that haplotype visits and matching there. Soft-clipped ends are excluded, so a partial hit can look better than it is; we show coverage alongside identity for that reason. MAPQ is 0 by design in a graph where every locus exists hundreds of times.

**"What does it cost to run?"**
One service with the graph, r-index, tag arrays and GBWT loaded, on the order of 250 GB of RAM, serving all users.

**"When can I use it?"**
It runs on the development browser now. Public release is the next milestone, after the validation comparisons above.
